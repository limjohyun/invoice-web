import path from 'path'
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Font,
} from '@react-pdf/renderer'
import type { InvoiceWithItems } from '@/lib/notion/types'

Font.register({
  family: 'NotoSansKR',
  src: path.join(process.cwd(), 'public/fonts/NotoSansKR-Variable.ttf'),
})

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansKR',
    fontSize: 10,
    padding: 40,
    color: '#111111',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  label: {
    width: 90,
    color: '#666666',
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 8,
    borderTop: '1px solid #dddddd',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #dddddd',
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #eeeeee',
    paddingVertical: 6,
  },
  colName: { width: '30%', paddingHorizontal: 4 },
  colDesc: { width: '25%', paddingHorizontal: 4, color: '#666666' },
  colQty: { width: '10%', paddingHorizontal: 4, textAlign: 'right' },
  colPrice: { width: '15%', paddingHorizontal: 4, textAlign: 'right' },
  colTax: { width: '10%', paddingHorizontal: 4, textAlign: 'right' },
  colAmount: { width: '10%', paddingHorizontal: 4, textAlign: 'right' },
  totalsBox: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  totalsRow: {
    flexDirection: 'row',
    width: 200,
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  totalsLabel: { color: '#666666' },
  grandTotalRow: {
    flexDirection: 'row',
    width: 200,
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
    borderTop: '1px solid #111111',
  },
  grandTotalText: { fontWeight: 700 },
})

function formatNumber(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value)
}

/** 견적서 상세 데이터를 PDF 문서로 렌더링하는 컴포넌트 (F007). */
export function InvoicePdfDocument({ invoice }: { invoice: InvoiceWithItems }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{invoice.title || '견적서'}</Text>
        <Text style={styles.subtitle}>
          {new Date(invoice.createdAt).toLocaleDateString('ko-KR')} 작성
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>거래처 정보</Text>
          <View style={styles.row}>
            <Text style={styles.label}>거래처명</Text>
            <Text style={styles.value}>{invoice.clientName || '-'}</Text>
          </View>
          {invoice.clientEmail && (
            <View style={styles.row}>
              <Text style={styles.label}>이메일</Text>
              <Text style={styles.value}>{invoice.clientEmail}</Text>
            </View>
          )}
          {invoice.clientPhone && (
            <View style={styles.row}>
              <Text style={styles.label}>연락처</Text>
              <Text style={styles.value}>{invoice.clientPhone}</Text>
            </View>
          )}
          {invoice.clientRegistrationNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>사업자등록번호</Text>
              <Text style={styles.value}>
                {invoice.clientRegistrationNumber}
              </Text>
            </View>
          )}
          {invoice.clientAddress && (
            <View style={styles.row}>
              <Text style={styles.label}>주소</Text>
              <Text style={styles.value}>{invoice.clientAddress}</Text>
            </View>
          )}
          {invoice.dueDate && (
            <View style={styles.row}>
              <Text style={styles.label}>기한</Text>
              <Text style={styles.value}>
                {new Date(invoice.dueDate).toLocaleDateString('ko-KR')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>품목</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.colName}>품목명</Text>
              <Text style={styles.colDesc}>설명</Text>
              <Text style={styles.colQty}>수량</Text>
              <Text style={styles.colPrice}>단가</Text>
              <Text style={styles.colTax}>세율</Text>
              <Text style={styles.colAmount}>금액</Text>
            </View>
            {invoice.items.map(item => (
              <View style={styles.tableRow} key={item.id}>
                <Text style={styles.colName}>{item.name}</Text>
                <Text style={styles.colDesc}>{item.description ?? '-'}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>
                  {formatNumber(item.unitPrice)}
                </Text>
                <Text style={styles.colTax}>
                  {item.taxRate ? `${item.taxRate}%` : '-'}
                </Text>
                <Text style={styles.colAmount}>
                  {formatNumber(item.amount)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsBox}>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalText}>합계</Text>
              <Text style={styles.grandTotalText}>
                {formatNumber(invoice.totalAmount)} {invoice.currency}
              </Text>
            </View>
          </View>
        </View>

        {invoice.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>메모</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
