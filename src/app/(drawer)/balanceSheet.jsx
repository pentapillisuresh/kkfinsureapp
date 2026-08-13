import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as XLSX from 'xlsx';
import { balanceSheetsAPI } from '../../api/balanceSheets';

// ---- Custom Dropdown Component ----
const CustomDropdown = ({ label, options, selectedValue, onSelect, placeholder }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedLabel = options.find(opt => opt.value === selectedValue)?.label || placeholder;

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.dropdownButtonText, !selectedValue && { color: '#999' }]}>
          {selectedLabel}
        </Text>
        <Feather name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === selectedValue && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === selectedValue && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ---- Main Component ----
const BalanceSheetScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();


  const [startMonth, setStartMonth] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [endYear, setEndYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);

  // Month options for dropdown
  const monthOptions = [
    { label: 'Jan', value: 'Jan' },
    { label: 'Feb', value: 'Feb' },
    { label: 'Mar', value: 'Mar' },
    { label: 'Apr', value: 'Apr' },
    { label: 'May', value: 'May' },
    { label: 'Jun', value: 'Jun' },
    { label: 'Jul', value: 'Jul' },
    { label: 'Aug', value: 'Aug' },
    { label: 'Sep', value: 'Sep' },
    { label: 'Oct', value: 'Oct' },
    { label: 'Nov', value: 'Nov' },
    { label: 'Dec', value: 'Dec' },
  ];

  // Year options – current year ± 5
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    yearOptions.push({ label: String(i), value: String(i) });
  }

  const handleGenerate = async () => {
    if (!startMonth || !startYear || !endMonth || !endYear) {
      Alert.alert('Missing Fields', 'Please select both start and end month/year.');
      return;
    }

    const startDate = `${startYear}-${String(monthOptions.findIndex(m => m.value === startMonth) + 1).padStart(2, '0')}-01`;
    const endDate = `${endYear}-${String(monthOptions.findIndex(m => m.value === endMonth) + 1).padStart(2, '0')}-01`;

    if (new Date(startDate) > new Date(endDate)) {
      Alert.alert('Invalid Period', 'Start date cannot be after end date.');
      return;
    }

    setLoading(true);
    try {
      const response = await balanceSheetsAPI.generateBalanceSheet({
        periodStart: startDate,
        periodEnd: endDate,
      });
      if (response.success) {
        setGeneratedData(response.data);
        setSummary(response.data.summary);
        setTransactions(response.data.transactions || []);
        setShowModal(true);
      } else {
        Alert.alert('Error', response.message || 'Failed to generate balance sheet.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Download as Excel
  const downloadExcel = async () => {
    if (!generatedData) return;
    try {
      const wb = XLSX.utils.book_new();
      // Summary sheet
      const summaryData = [
        ['Balance Sheet Summary'],
        [],
        ['User', generatedData.user.fullName],
        ['Email', generatedData.user.email],
        ['Period Start', generatedData.summary.period.start],
        ['Period End', generatedData.summary.period.end],
        [],
        ['Total Investments', generatedData.summary.totalInvestments],
        ['Total Returns', generatedData.summary.totalReturns],
        ['Total Commissions', generatedData.summary.totalCommissions],
        ['Net Worth', generatedData.summary.netWorth],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

      // Transactions sheet
      const txData = [
        ['Date', 'Description', 'Type', 'Amount (₹)', 'Balance (₹)']
      ];
      generatedData.transactions.forEach(tx => {
        txData.push([
          tx.formattedDate,
          tx.description,
          tx.type,
          tx.amount,
          tx.balance,
        ]);
      });
      const ws2 = XLSX.utils.aoa_to_sheet(txData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Transactions');

      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const filename = FileSystem.documentDirectory + `balance_sheet_${Date.now()}.xlsx`;
      await FileSystem.writeAsStringAsync(filename, wbout, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(filename);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate Excel file.');
    }
  };

  // Download as PDF (simple text for demo)
  const downloadPDF = async () => {
    if (!generatedData) return;
    try {
      const content = `
        BALANCE SHEET
        User: ${generatedData.user.fullName}
        Period: ${generatedData.summary.period.start} to ${generatedData.summary.period.end}
        Total Investments: ₹${generatedData.summary.totalInvestments}
        Total Returns: ₹${generatedData.summary.totalReturns}
        Total Commissions: ₹${generatedData.summary.totalCommissions}
        Net Worth: ₹${generatedData.summary.netWorth}
        ${'-'.repeat(40)}
        Transactions:
        ${generatedData.transactions.map(t => `${t.formattedDate} | ${t.description} | ${t.type} | ₹${t.amount} | ₹${t.balance}`).join('\n')}
      `;
      const filename = FileSystem.documentDirectory + `balance_sheet_${Date.now()}.txt`;
      await FileSystem.writeAsStringAsync(filename, content);
      await Sharing.shareAsync(filename);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.transactionRow}>
      <Text style={styles.txDate}>{item.formattedDate}</Text>
      <Text style={styles.txDesc} numberOfLines={1}>{item.description}</Text>
      <Text style={[styles.txAmount, item.amount < 0 ? styles.negative : styles.positive]}>
        {item.amount < 0 ? '-' : '+'}{Math.abs(item.amount)}
      </Text>
      <Text style={styles.txBalance}>₹{item.balance}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Text style={styles.title}>Balance Sheet</Text>
      <Text style={styles.subtitle}>Select period to generate statement</Text>

      <View style={styles.row}>
        <View style={styles.half}>
          <CustomDropdown
            label="Start Month"
            options={monthOptions}
            selectedValue={startMonth}
            onSelect={setStartMonth}
            placeholder="Select month"
          />
        </View>
        <View style={styles.half}>
          <CustomDropdown
            label="Start Year"
            options={yearOptions}
            selectedValue={startYear}
            onSelect={setStartYear}
            placeholder="Select year"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <CustomDropdown
            label="End Month"
            options={monthOptions}
            selectedValue={endMonth}
            onSelect={setEndMonth}
            placeholder="Select month"
          />
        </View>
        <View style={styles.half}>
          <CustomDropdown
            label="End Year"
            options={yearOptions}
            selectedValue={endYear}
            onSelect={setEndYear}
            placeholder="Select year"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.generateButton}
        onPress={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Generate Balance Sheet</Text>
        )}
      </TouchableOpacity>

      {/* Result Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { paddingTop: 20 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Balance Sheet</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }}>
            {summary && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Period: {summary.period.start.slice(0,7)} to {summary.period.end.slice(0,7)}</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryItem}>Investments: ₹{summary.totalInvestments}</Text>
                  <Text style={styles.summaryItem}>Returns: ₹{summary.totalReturns}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryItem}>Commissions: ₹{summary.totalCommissions}</Text>
                  <Text style={styles.summaryItem}>Net Worth: ₹{summary.netWorth}</Text>
                </View>
              </View>
            )}

            <Text style={styles.tableHeader}>Transactions</Text>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.thDate}>Date</Text>
              <Text style={styles.thDesc}>Description</Text>
              <Text style={styles.thAmount}>Amount</Text>
              <Text style={styles.thBalance}>Balance</Text>
            </View>

            <FlatList
              data={transactions}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              ListEmptyComponent={<Text style={styles.empty}>No transactions</Text>}
              scrollEnabled={false}
            />

            <View style={styles.downloadRow}>
              <TouchableOpacity style={styles.downloadBtn} onPress={downloadPDF}>
                <Feather name="file-text" size={20} color="#fff" />
                <Text style={styles.downloadBtnText}>PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: '#0f9d58' }]} onPress={downloadExcel}>
                <Feather name="file" size={20} color="#fff" />
                <Text style={styles.downloadBtnText}>Excel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A2332', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7A8F', marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  half: { flex: 1 },
  label: { fontSize: 13, fontWeight: '600', color: '#1A2332', marginBottom: 6 },

  // Custom dropdown
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownButtonText: { fontSize: 15, color: '#1A2332' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  modalHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#1A2332' },
  optionItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  optionItemSelected: { backgroundColor: '#f0f4ff' },
  optionText: { fontSize: 16, color: '#1A2332' },
  optionTextSelected: { fontWeight: '700', color: '#2B46D5' },

  generateButton: {
    backgroundColor: '#2B46D5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  modalContainer: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A2332' },
  summaryCard: {
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  summaryLabel: { fontSize: 14, fontWeight: '600', color: '#1A2332', marginBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryItem: { fontSize: 13, color: '#1A2332' },
  tableHeader: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#E8ECF0',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginBottom: 6,
  },
  thDate: { flex: 0.25, fontWeight: 'bold', fontSize: 12, color: '#1A2332' },
  thDesc: { flex: 0.35, fontWeight: 'bold', fontSize: 12, color: '#1A2332' },
  thAmount: { flex: 0.2, fontWeight: 'bold', fontSize: 12, color: '#1A2332', textAlign: 'right' },
  thBalance: { flex: 0.2, fontWeight: 'bold', fontSize: 12, color: '#1A2332', textAlign: 'right' },
  transactionRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  txDate: { flex: 0.25, fontSize: 12, color: '#1A2332' },
  txDesc: { flex: 0.35, fontSize: 12, color: '#1A2332' },
  txAmount: { flex: 0.2, textAlign: 'right', fontWeight: 'bold' },
  positive: { color: '#7CB80B' },
  negative: { color: '#E03333' },
  txBalance: { flex: 0.2, textAlign: 'right', fontSize: 12, color: '#1A2332' },
  empty: { textAlign: 'center', color: '#6B7A8F', paddingVertical: 20 },
  downloadRow: { flexDirection: 'row', gap: 12, marginVertical: 20 },
  downloadBtn: {
    flex: 1,
    backgroundColor: '#2B46D5',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  downloadBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default BalanceSheetScreen;