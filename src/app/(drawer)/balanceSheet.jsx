import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
            <View style={styles.dropdownModalHeader}>
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
    const endDate = `${endYear}-${String(monthOptions.findIndex(m => m.value === endMonth) + 1).padStart(2, '0')}-28`;

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
    if (!generatedData) {
      Alert.alert('Error', 'No data to export.');
      return;
    }

    try {
      setLoading(true);

      const wb = XLSX.utils.book_new();

      // Summary Sheet
      const summaryData = [
        ['BALANCE SHEET SUMMARY'],
        [''],
        ['User:', generatedData.user.fullName],
        ['Email:', generatedData.user.email],
        ['Period Start:', generatedData.summary.period.start],
        ['Period End:', generatedData.summary.period.end],
        [''],
        ['TOTALS'],
        ['Total Investments:', generatedData.summary.totalInvestments],
        ['Total Returns:', generatedData.summary.totalReturns],
        ['Total referrer payouts', generatedData.summary.totalCommissions],
        ['Net Worth:', generatedData.summary.netWorth],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      ws1['!cols'] = [{ wch: 20 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

      // Transactions Sheet
      const txData = [
        ['Date', 'Description', 'Type', 'Amount (₹)', 'Balance (₹)']
      ];

      if (generatedData.transactions && generatedData.transactions.length > 0) {
        generatedData.transactions.forEach(tx => {
          txData.push([
            tx.formattedDate || tx.date || '',
            tx.description || '',
            tx.type || '',
            tx.ROI || '',
            tx.amount || 0,
            tx.balance || 0,
          ]);
        });
      } else {
        txData.push(['No transactions found', '', '', '', '']);
      }

      const ws2 = XLSX.utils.aoa_to_sheet(txData);
      ws2['!cols'] = [
        { wch: 15 },
        { wch: 35 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];
      XLSX.utils.book_append_sheet(wb, ws2, 'Transactions');

      // Generate file
      const wbout = XLSX.write(wb, {
        type: 'base64',
        bookType: 'xlsx',
        bookSST: false,
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `balance_sheet_${timestamp}.xlsx`;
      const filePath = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(filePath, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        throw new Error('File was not created successfully');
      }

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(filePath, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Download Balance Sheet',
        UTI: 'com.microsoft.excel.xlsx',
      });

      Alert.alert('Success', 'Excel file downloaded successfully!');

    } catch (error) {
      console.error('Excel generation error:', error);
      Alert.alert(
        'Export Error',
        'Failed to generate Excel file. Please try CSV format.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Download as CSV (Fallback)
  const downloadCSV = async () => {
    if (!generatedData) {
      Alert.alert('Error', 'No data to export.');
      return;
    }

    try {
      setLoading(true);

      let csvContent = '';

      csvContent += 'BALANCE SHEET SUMMARY\n\n';
      csvContent += `User,${generatedData.user.fullName}\n`;
      csvContent += `Email,${generatedData.user.email}\n`;
      csvContent += `Period Start,${generatedData.summary.period.start}\n`;
      csvContent += `Period End,${generatedData.summary.period.end}\n\n`;

      csvContent += 'TOTALS\n';
      csvContent += `Total Investments,${generatedData.summary.totalInvestments}\n`;
      csvContent += `Total Returns,${generatedData.summary.totalReturns}\n`;
      csvContent += `Total referrer payouts,${generatedData.summary.totalCommissions}\n`;
      csvContent += `Net Worth,${generatedData.summary.netWorth}\n\n`;

      csvContent += 'TRANSACTIONS\n';
      csvContent += 'Date,Description,Type,Amount (₹),Balance (₹)\n';

      if (generatedData.transactions && generatedData.transactions.length > 0) {
        generatedData.transactions.forEach(tx => {
          const date = (tx.formattedDate || tx.date || '').replace(/,/g, '');
          const description = (tx.description || '').replace(/,/g, '');
          const type = (tx.type || '').replace(/,/g, '');
          csvContent += `${date},${description},${type},${tx.amount || 0},${tx.balance || 0}\n`;
        });
      } else {
        csvContent += 'No transactions found,,,,';
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `balance_sheet_${timestamp}.csv`;
      const filePath = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(filePath, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(filePath, {
        mimeType: 'text/csv',
        dialogTitle: 'Download Balance Sheet',
      });

      Alert.alert('Success', 'CSV file downloaded successfully!');

    } catch (error) {
      console.error('CSV generation error:', error);
      Alert.alert('Export Error', 'Failed to generate CSV file.');
    } finally {
      setLoading(false);
    }
  };

  const getLogoBase64 = async () => {
    try {
      const asset = Image.resolveAssetSource(
        require('../../../assets/images/logo3.jpeg')
      );

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      return await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          resolve(reader.result);
        };

        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Logo conversion error:', error);
      return null;
    }
  };

  // Download as PDF
  const downloadPDF = async () => {
    if (!generatedData) return;
    try {
      const LOGO_DATA_URI = await getLogoBase64();


      const htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
                padding: 40px;
                background: #ffffff;
                color: #1A2332;
              }
              .container { max-width: 800px; margin: 0 auto; }
              
              /* New Logo Styling */
              .logo-container {
                text-align: center;
                margin-bottom: 20px;
              }
              .logo-container img {
                max-width: 120px;
                height: auto;
                display: inline-block;
              }
              .tagline {
                color: #6B7A8F;
                font-size: 12px;
                letter-spacing: 0.5px;
                font-weight: 500;
                margin-top: 4px;
                display: block;
              }
              
              h1 { 
                color: #1A2332; 
                text-align: center; 
                font-size: 28px;
                margin-bottom: 10px;
                border-bottom: 3px solid #2B46D5;
                padding-bottom: 15px;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px;
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
              }
              .header p { margin: 5px 0; font-size: 14px; }
              .header strong { color: #2B46D5; }
              .summary { 
                background: #f0f4ff; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0;
                border-left: 4px solid #2B46D5;
              }
              .summary-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 12px;
                color: #1A2332;
              }
              .summary-row { 
                display: flex; 
                justify-content: space-between; 
                padding: 6px 0;
                font-size: 14px;
              }
              .summary-row.total {
                border-top: 2px solid #2B46D5;
                margin-top: 8px;
                padding-top: 12px;
                font-weight: bold;
                font-size: 16px;
              }
              h2 { 
                font-size: 20px; 
                margin: 25px 0 15px 0;
                color: #1A2332;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 15px 0 30px 0;
                font-size: 13px;
              }
              th { 
                background: #2B46D5; 
                color: white;
                padding: 10px 12px; 
                text-align: left; 
                font-weight: 600;
              }
              td { 
                padding: 8px 12px; 
                border-bottom: 1px solid #E8ECF0;
              }
              tr:nth-child(even) { background: #f8f9fa; }
              .positive { color: #7CB80B; font-weight: 600; }
              .negative { color: #E03333; font-weight: 600; }
              .text-right { text-align: right; }
              .footer { 
                margin-top: 30px; 
                text-align: center; 
                color: #6B7A8F; 
                font-size: 12px;
                border-top: 1px solid #E8ECF0;
                padding-top: 20px;
              }
              .badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
              }
              .badge-income { background: #e8f5e9; color: #2e7d32; }
              .badge-expense { background: #fce4ec; color: #c62828; }
              .badge-investment { background: #e3f2fd; color: #1565c0; }
            </style>
          </head>
          <body>
            <div class="container">
              
              <!-- LOGO ADDED HERE (Now using Data URI) -->
             <!-- Logo -->
<div class="logo-container">
  ${LOGO_DATA_URI
          ? `<img src="${LOGO_DATA_URI}" alt="KKFinsure Logo" />`
          : ''
        }
  <div class="tagline">Wealth | Trust | Growth</div>
</div>
              
              <h1>📊 Balance Sheet</h1>
              
              <div class="header">
                <p><strong>User:</strong> ${generatedData.user.fullName}</p>
                <p><strong>Email:</strong> ${generatedData.user.email}</p>
                <p><strong>Period:</strong> ${generatedData.summary.period.start.slice(0, 7)} to ${generatedData.summary.period.end.slice(0, 7)}</p>
              </div>
              
              <div class="summary">
                <div class="summary-title">📈 Summary</div>
                <div class="summary-row">
                  <span>Total Investments</span>
                  <span>₹${generatedData.summary.totalInvestments}</span>
                </div>
                <div class="summary-row">
                  <span>Total Returns</span>
                  <span>₹${generatedData.summary.totalReturns}</span>
                </div>
                <div class="summary-row">
                  <span>Total payouts</span>
                  <span>₹${generatedData.summary.totalCommissions}</span>
                </div>
                <div class="summary-row total">
                  <span>Net Worth</span>
                  <span>₹${generatedData.summary.netWorth}</span>
                </div>
              </div>

              <h2>📋 Transactions</h2>
              <table>
                <thead>
                  <tr>
                    <th style="width: 15%">Date</th>
                    <th style="width: 30%">Description</th>
                    <th style="width: 20%">Type</th>
                    <th style="width: 17%; text-align: right">Amount</th>
                    <th style="width: 18%; text-align: right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  ${generatedData.transactions.map(t => `
                    <tr>
                      <td>${t.formattedDate}</td>
                      <td>${t.description}</td>
                      <td>
                        <span class="badge badge-${t.type === 'income' ? 'income' : t.type === 'expense' ? 'expense' : 'investment'}">
                          ${t.type}
                        </span>
                      </td>
                      <td class="text-right ${t.amount < 0 ? 'negative' : 'positive'}">
                        ${t.amount < 0 ? '-' : '+'}₹${Math.abs(t.amount)}
                      </td>
                      <td class="text-right">₹${t.balance}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="footer">
                Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                <br>© ${new Date().getFullYear()} KKFinsure. All rights reserved.
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };

  const renderItem = ({ item }) => {
    const isCredit =
      item.type === "return" || item.type === "commission";

    const isDebit = item.type === "debit";

    return (
      <View style={styles.transactionRow}>
        {/* Date */}
        <Text style={styles.txDate}>
          {item.formattedDate || "-"}
        </Text>

        {/* ROI */}
        <Text style={styles.txDesc} numberOfLines={1}>
        {item.ROI ? `${parseInt(item.ROI, 10)}%` : "-"}        </Text>

        {/* Credit Amount */}
        <Text
          style={[
            styles.txAmount,
            styles.positive,
          ]}
        >
          {isCredit && item.amount > 0
            ? `+${item.amount}`
            : ""}
        </Text>

        {/* Debit Amount */}
        <Text
          style={[
            styles.txAmount,
            styles.negative,
          ]}
        >
          {isDebit && item.amount < 0
            ? `-${Math.abs(item.amount)}`
            : ""}
        </Text>

        {/* Balance */}
        <Text style={styles.txBalance}>
          ₹{item.balance ?? 0}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
      {/* New Blue Header */}
  <View
  style={{
    backgroundColor: '#2B46D5',
    height: 210,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: insets.top + 10,
    paddingHorizontal: 20,
  }}
>
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <TouchableOpacity onPress={() => router.back()}>
      <Feather name="arrow-left" color="#FFFFFF" size={26} />
    </TouchableOpacity>

    {/* Logo & Tagline Container */}
    <View style={{ alignItems: 'center', flex: 1, marginHorizontal: 10, marginTop: -5 }}>
      <Image
        source={require('../../../assets/images/logo3.jpeg')}
        style={{ width: 130, height: 50, resizeMode: 'contain' }}
      />
      <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginTop: 2, opacity: 0.9 }}>
        Asset - Wealth Management
      </Text>
      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '500', letterSpacing: 0.3, marginTop: 1 }}>
        Wealth || Trust || Growth
      </Text>
    </View>

    <View style={{ width: 24 }} />
  </View>

  <View style={{ marginTop: 16 }}>
    <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800' }}>Balance Sheet</Text>
    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
      Generate and manage your statements
    </Text>
  </View>
</View>

      <SafeAreaView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>
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
          <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fa' }}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.modalTitle}>Balance Sheet</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Main Content Area - Buttons now at the top */}
            <View style={{ flex: 1 }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30 }}
              >
                {/* Buttons section - MOVED TO THE TOP */}
                <View style={{ marginBottom: 20 }}>
                  <View style={styles.downloadRow}>
                    <TouchableOpacity style={styles.downloadBtn} onPress={downloadPDF}>
                      <Feather name="file-text" size={20} color="#fff" />
                      <Text style={styles.downloadBtnText}>PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.downloadBtn, { backgroundColor: '#0f9d58' }]}
                      onPress={downloadExcel}
                    >
                      <Feather name="file" size={20} color="#fff" />
                      <Text style={styles.downloadBtnText}>Excel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.downloadBtn, { backgroundColor: '#f39c12' }]}
                      onPress={downloadCSV}
                    >
                      <Feather name="file" size={20} color="#fff" />
                      <Text style={styles.downloadBtnText}>CSV</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {summary && (
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Period: {summary.period.start.slice(0, 7)} to {summary.period.end.slice(0, 7)}</Text>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryItem}>Investments: ₹{summary.totalInvestments}</Text>
                      <Text style={styles.summaryItem}>Returns: ₹{summary.totalReturns}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryItem}>Payouts: ₹{summary.totalCommissions}</Text>
                      <Text style={styles.summaryItem}>Net Worth: ₹{summary.netWorth}</Text>
                    </View>
                  </View>
                )}

                <Text style={styles.tableHeader}>Transactions</Text>
                <View style={styles.tableHeaderRow}>
                  <Text style={styles.thDate}>Date</Text>
                  <Text style={styles.thDesc}>ROI</Text>
                  <Text style={styles.thAmount}>Cr.Amt</Text>
                  <Text style={styles.thAmount}>Dt.Amt</Text>
                  <Text style={styles.thBalance}>Balance</Text>
                </View>

                <FlatList
                  data={transactions}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={renderItem}
                  ListEmptyComponent={<Text style={styles.empty}>No transactions</Text>}
                  scrollEnabled={false}
                />
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  subtitle: { fontSize: 14, color: '#6B7A8F', marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  half: { flex: 1 },
  label: { fontSize: 13, fontWeight: '600', color: '#1A2332', marginBottom: 6 },

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

  dropdownModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
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

  // Modal Styles
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A2332' },
  summaryCard: {
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  summaryLabel: { fontSize: 14, fontWeight: '600', color: '#1A2332', marginBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryItem: { fontSize: 13, color: '#1A2332' },
  tableHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
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
  txDesc: { flex: 0.2, fontSize: 12, color: '#1A2332' },
  txAmount: { flex: 0.2, textAlign: 'right', fontWeight: 'bold' },
  positive: { color: '#7CB80B' },
  negative: { color: '#E03333' },
  txBalance: { flex: 0.2, textAlign: 'right', fontSize: 12, color: '#1A2332' },
  empty: { textAlign: 'center', color: '#6B7A8F', paddingVertical: 20 },

  // Export Buttons Styles
  downloadRow: { flexDirection: 'row', gap: 12 },
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