import React from 'react';
import { View, Text } from 'react-native';

const Disclaimer = () => {
  return (
    <View
      style={{
        width: '100%',
        minHeight: 50,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E8ECF0',
        paddingHorizontal: 12,
        paddingVertical: 10,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: '#7A8494',
          fontSize: 10,
          lineHeight: 15,
          textAlign: 'center',
          fontWeight: '400',
        }}
      >
        <Text
          style={{
            color: '#6B7280',
            fontSize: 10,
            fontWeight: '600',
          }}
        >
          Disclaimer:{' '}
        </Text>
        Investment in securities is subject to market risk. Read all related
        documents carefully before investing.
      </Text>
    </View>
  );
};

export default Disclaimer;