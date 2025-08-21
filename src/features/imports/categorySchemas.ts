export interface ColumnSpec {
  key: string
  label: string
  required?: boolean
  example?: string
}

export interface CategorySchema {
  id: string
  title: string
  help: string
  schema: ColumnSpec[]
  accept: string[]
  templateHref?: string
  icon: string
}

export const CATEGORY_SCHEMAS: Record<string, CategorySchema> = {
  sales: {
    id: 'sales',
    title: 'Sales',
    help: 'Import sales data from Amazon Seller Central India (TSV format)',
    icon: '📈',
    schema: [
      { key: 'order-id', label: 'Order ID', required: true, example: '408-4870009-9733125' },
      { key: 'order-item-id', label: 'Order Item ID', required: false, example: '52336476957402' },
      { key: 'purchase-date', label: 'Purchase Date', required: true, example: '2025-07-30T08:34:47+00:00' },
      { key: 'payments-date', label: 'Payments Date', required: false, example: '2025-07-30T08:34:47+00:00' },
      { key: 'reporting-date', label: 'Reporting Date', required: false, example: '2025-07-31T04:21:19+00:00' },
      { key: 'promise-date', label: 'Promise Date', required: false, example: '2025-08-21T18:29:59+00:00' },
      { key: 'days-past-promise', label: 'Days Past Promise', required: false, example: '-2' },
      { key: 'buyer-email', label: 'Buyer Email', required: false, example: 'buyer@marketplace.amazon.in' },
      { key: 'buyer-name', label: 'Buyer Name', required: false, example: 'John Doe' },
      { key: 'buyer-phone-number', label: 'Buyer Phone', required: false, example: '9855161554' },
      { key: 'sku', label: 'SKU', required: true, example: 'ARB_B0B79CYVTM' },
      { key: 'product-name', label: 'Product Name', required: false, example: 'VSN Noise Gate Pedal' },
      { key: 'quantity-purchased', label: 'Quantity Purchased', required: true, example: '1' },
      { key: 'quantity-shipped', label: 'Quantity Shipped', required: false, example: '0' },
      { key: 'quantity-to-ship', label: 'Quantity To Ship', required: false, example: '1' },
      { key: 'ship-service-level', label: 'Ship Service Level', required: false, example: 'Standard' },
      { key: 'recipient-name', label: 'Recipient Name', required: false, example: 'John Doe' },
      { key: 'ship-address-1', label: 'Ship Address 1', required: false, example: '123 Main Street' },
      { key: 'ship-address-2', label: 'Ship Address 2', required: false, example: 'Apt 4B' },
      { key: 'ship-address-3', label: 'Ship Address 3', required: false, example: 'Building A' },
      { key: 'ship-city', label: 'Ship City', required: false, example: 'CHANDIGARH' },
      { key: 'ship-state', label: 'Ship State', required: false, example: 'CHANDIGARH' },
      { key: 'ship-postal-code', label: 'Ship Postal Code', required: false, example: '160101' },
      { key: 'ship-country', label: 'Ship Country', required: false, example: 'IN' },
      { key: 'is-business-order', label: 'Is Business Order', required: false, example: 'false' },
      { key: 'purchase-order-number', label: 'Purchase Order Number', required: false, example: '' },
      { key: 'price-designation', label: 'Price Designation', required: false, example: 'Business Price' },
      { key: 'is-iba', label: 'Is IBA', required: false, example: 'false' },
      { key: 'verge-of-cancellation', label: 'Verge of Cancellation', required: false, example: 'false' },
      { key: 'verge-of-lateShipment', label: 'Verge of Late Shipment', required: false, example: 'false' }
    ],
    accept: ['.csv', '.txt', '.tsv', '.tsp', '.xlsx', 'text/tab-separated-values', 'text/plain'],
    templateHref: '/templates/sales-template.csv'
  },
  purchase: {
    id: 'purchase',
    title: 'Purchase',
    help: 'Import purchase order data from suppliers, Amazon.com, or procurement systems',
    icon: '🛒',
    schema: [
      { key: 'po_id', label: 'PO ID', required: true, example: 'PO-2024-001' },
      { key: 'order_date', label: 'Order Date', required: true, example: '2024-01-15' },
      { key: 'supplier', label: 'Supplier', required: true, example: 'ABC Electronics' },
      { key: 'asin', label: 'ASIN', required: true, example: 'B08N5WRWNW' },
      { key: 'sku', label: 'SKU', required: false, example: 'PROD-001' },
      { key: 'title', label: 'Product Title', required: false, example: 'Wireless Headphones' },
      { key: 'qty', label: 'Quantity', required: true, example: '100' },
      { key: 'unit_cost', label: 'Unit Cost', required: true, example: '15.50' },
      { key: 'ship_from', label: 'Ship From', required: false, example: 'Shenzhen, China' },
      { key: 'ship_to', label: 'Ship To', required: false, example: 'New York, USA' },
      { key: 'tracking', label: 'Tracking Number', required: false, example: '1Z999AA1234567890' },
      { key: 'carrier', label: 'Carrier', required: false, example: 'UPS' },
      { key: 'invoice_no', label: 'Invoice Number', required: false, example: 'INV-2024-001' }
    ],
    accept: ['.csv', '.txt', '.xlsx'],
    templateHref: '/templates/purchase-template.csv'
  },
  'international-shipping': {
    id: 'international-shipping',
    title: 'International Shipping',
    help: 'Import international shipping data from forwarders, customs, and logistics providers',
    icon: '🌍',
    schema: [
      { key: 'shipment_id', label: 'Shipment ID', required: true, example: 'SHIP-2024-001' },
      { key: 'forwarder', label: 'Forwarder', required: true, example: 'Tackry Logistics' },
      { key: 'origin_country', label: 'Origin Country', required: true, example: 'China' },
      { key: 'depart_date', label: 'Departure Date', required: true, example: '2024-01-15' },
      { key: 'arrival_date', label: 'Arrival Date', required: false, example: '2024-01-25' },
      { key: 'status', label: 'Status', required: false, example: 'In Transit' },
      { key: 'awb', label: 'AWB Number', required: false, example: '123-45678901' },
      { key: 'carton_count', label: 'Carton Count', required: false, example: '50' },
      { key: 'chargeable_weight', label: 'Chargeable Weight (kg)', required: false, example: '250.5' },
      { key: 'freight_cost', label: 'Freight Cost', required: false, example: '1500.00' },
      { key: 'duties', label: 'Duties', required: false, example: '250.00' },
      { key: 'tax', label: 'Tax', required: false, example: '75.00' },
      { key: 'other_fees', label: 'Other Fees', required: false, example: '100.00' }
    ],
    accept: ['.csv', '.txt', '.xlsx'],
    templateHref: '/templates/international-shipping-template.csv'
  },
  'national-shipping': {
    id: 'national-shipping',
    title: 'National Shipping',
    help: 'Import domestic shipping data from couriers and logistics providers',
    icon: '🚚',
    schema: [
      { key: 'airwaybill', label: 'Airway Bill', required: true, example: 'AWB123456789' },
      { key: 'courier', label: 'Courier', required: true, example: 'FedEx' },
      { key: 'pickup_date', label: 'Pickup Date', required: true, example: '2024-01-15' },
      { key: 'delivered_date', label: 'Delivered Date', required: false, example: '2024-01-17' },
      { key: 'status', label: 'Status', required: false, example: 'Delivered' },
      { key: 'pincode', label: 'Pincode', required: false, example: '10001' },
      { key: 'city', label: 'City', required: false, example: 'New York' },
      { key: 'state', label: 'State', required: false, example: 'NY' },
      { key: 'charge_weight', label: 'Charge Weight (kg)', required: false, example: '2.5' },
      { key: 'shipping_cost', label: 'Shipping Cost', required: false, example: '25.00' },
      { key: 'cod_amount', label: 'COD Amount', required: false, example: '0.00' }
    ],
    accept: ['.csv', '.txt', '.xlsx'],
    templateHref: '/templates/national-shipping-template.csv'
  },
  payment: {
    id: 'payment',
    title: 'Payment',
    help: 'Import payment and settlement data from payment processors and financial systems',
    icon: '💳',
    schema: [
      { key: 'txn_id', label: 'Transaction ID', required: true, example: 'TXN-2024-001' },
      { key: 'txn_date', label: 'Transaction Date', required: true, example: '2024-01-15' },
      { key: 'order_id', label: 'Order ID', required: false, example: '123-4567890-1234567' },
      { key: 'amount', label: 'Amount', required: true, example: '29.99' },
      { key: 'currency', label: 'Currency', required: false, example: 'USD' },
      { key: 'fee', label: 'Fee', required: false, example: '1.50' },
      { key: 'tax', label: 'Tax', required: false, example: '2.40' },
      { key: 'other', label: 'Other Charges', required: false, example: '0.00' },
      { key: 'total', label: 'Total', required: false, example: '33.89' },
      { key: 'txn_type', label: 'Transaction Type', required: false, example: 'Sale' },
      { key: 'status', label: 'Status', required: false, example: 'Completed' },
      { key: 'settlement_id', label: 'Settlement ID', required: false, example: 'SETT-2024-001' },
      { key: 'settlement_date', label: 'Settlement Date', required: false, example: '2024-01-20' }
    ],
    accept: ['.csv', '.txt', '.xlsx'],
    templateHref: '/templates/payment-template.csv'
  },
  refund: {
    id: 'refund',
    title: 'Refund',
    help: 'Import refund and return data from e-commerce platforms and customer service systems',
    icon: '↩️',
    schema: [
      { key: 'rma_id', label: 'RMA ID', required: true, example: 'RMA-2024-001' },
      { key: 'order_id', label: 'Order ID', required: true, example: '123-4567890-1234567' },
      { key: 'refund_date', label: 'Refund Date', required: true, example: '2024-01-15' },
      { key: 'reason', label: 'Reason', required: false, example: 'Customer Return' },
      { key: 'amount', label: 'Refund Amount', required: true, example: '29.99' },
      { key: 'fee_refund', label: 'Fee Refund', required: false, example: '1.50' },
      { key: 'tax_refund', label: 'Tax Refund', required: false, example: '2.40' },
      { key: 'method', label: 'Refund Method', required: false, example: 'Credit Card' },
      { key: 'status', label: 'Status', required: false, example: 'Processed' },
      { key: 'note', label: 'Note', required: false, example: 'Customer requested return' }
    ],
    accept: ['.csv', '.txt', '.xlsx'],
    templateHref: '/templates/refund-template.csv'
  },
  fba: {
    id: 'fba',
    title: 'FBA',
    help: 'Import FBA (Fulfillment by Amazon) data including inbound, transfers, and removals',
    icon: '📦',
    schema: [
      { key: 'ref_id', label: 'Reference ID', required: true, example: 'FBA-2024-001' },
      { key: 'event_date', label: 'Event Date', required: true, example: '2024-01-15' },
      { key: 'event_type', label: 'Event Type', required: true, example: 'Inbound' },
      { key: 'asin', label: 'ASIN', required: true, example: 'B08N5WRWNW' },
      { key: 'sku', label: 'SKU', required: false, example: 'PROD-001' },
      { key: 'qty', label: 'Quantity', required: true, example: '100' },
      { key: 'fulfillment_center', label: 'Fulfillment Center', required: false, example: 'PHX6' },
      { key: 'note', label: 'Note', required: false, example: 'Standard inbound shipment' }
    ],
    accept: ['.csv', '.txt', '.xlsx'],
    templateHref: '/templates/fba-template.csv'
  }
}

export const getCategorySchema = (id: string): CategorySchema | undefined => {
  return CATEGORY_SCHEMAS[id]
}

export const getAllCategories = (): CategorySchema[] => {
  return Object.values(CATEGORY_SCHEMAS)
}
