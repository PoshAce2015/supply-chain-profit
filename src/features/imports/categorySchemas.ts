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
    help: 'Import sales data from Amazon Seller Central, Poshace.com, Flipkart.com or any sales platform',
    icon: '📈',
    schema: [
      // Order Information
      { key: 'order-id', label: 'Order ID', required: false, example: '408-4870009-9733125' },
      { key: 'order-item-id', label: 'Order Item ID', required: false, example: '52336476957402' },
      { key: 'purchase-date', label: 'Purchase Date', required: false, example: '2025-07-30T08:34:47+00:00' },
      { key: 'payments-date', label: 'Payments Date', required: false, example: '2025-07-30T08:34:47+00:00' },
      { key: 'reporting-date', label: 'Reporting Date', required: false, example: '2025-07-31T04:21:19+00:00' },
      { key: 'promise-date', label: 'Promise Date', required: false, example: '2025-08-21T18:29:59+00:00' },
      { key: 'days-past-promise', label: 'Days Past Promise', required: false, example: '-2' },
      { key: 'order-status', label: 'Order Status', required: false, example: 'Shipped' },
      { key: 'fulfillment-channel', label: 'Fulfillment Channel', required: false, example: 'Amazon' },
      { key: 'sales-channel', label: 'Sales Channel', required: false, example: 'Amazon.com' },
      
      // Customer Information
      { key: 'buyer-email', label: 'Buyer Email', required: false, example: 'buyer@marketplace.amazon.in' },
      { key: 'buyer-name', label: 'Buyer Name', required: false, example: 'John Doe' },
      { key: 'buyer-phone-number', label: 'Buyer Phone', required: false, example: '9855161554' },
      { key: 'is-business-order', label: 'Is Business Order', required: false, example: 'false' },
      { key: 'purchase-order-number', label: 'Purchase Order Number', required: false, example: '' },
      { key: 'price-designation', label: 'Price Designation', required: false, example: 'Business Price' },
      { key: 'is-iba', label: 'Is IBA', required: false, example: 'false' },
      
      // Product Information
      { key: 'sku', label: 'SKU', required: false, example: 'ARB_B0B79CYVTM' },
      { key: 'product-name', label: 'Product Name', required: false, example: 'VSN Noise Gate Pedal' },
      { key: 'asin', label: 'ASIN', required: false, example: 'B08N5WRWNW' },
      { key: 'product-title', label: 'Product Title', required: false, example: 'Wireless Headphones' },
      { key: 'brand', label: 'Brand', required: false, example: 'Sony' },
      { key: 'category', label: 'Category', required: false, example: 'Electronics' },
      { key: 'subcategory', label: 'Subcategory', required: false, example: 'Audio Equipment' },
      { key: 'product-condition', label: 'Product Condition', required: false, example: 'New' },
      
      // Quantity Information
      { key: 'quantity-purchased', label: 'Quantity Purchased', required: false, example: '1' },
      { key: 'quantity-shipped', label: 'Quantity Shipped', required: false, example: '0' },
      { key: 'quantity-to-ship', label: 'Quantity To Ship', required: false, example: '1' },
      { key: 'quantity-returned', label: 'Quantity Returned', required: false, example: '0' },
      
      // Pricing Information
      { key: 'item-price', label: 'Item Price', required: false, example: '29.99' },
      { key: 'item-tax', label: 'Item Tax', required: false, example: '2.40' },
      { key: 'shipping-price', label: 'Shipping Price', required: false, example: '4.99' },
      { key: 'shipping-tax', label: 'Shipping Tax', required: false, example: '0.40' },
      { key: 'item-promotion-discount', label: 'Item Promotion Discount', required: false, example: '5.00' },
      { key: 'ship-promotion-discount', label: 'Ship Promotion Discount', required: false, example: '0.00' },
      { key: 'item-total', label: 'Item Total', required: false, example: '32.38' },
      { key: 'currency', label: 'Currency', required: false, example: 'USD' },
      
      // Commission and Fees
      { key: 'commission', label: 'Commission', required: false, example: '4.86' },
      { key: 'referral-fee', label: 'Referral Fee', required: false, example: '3.00' },
      { key: 'variable-closing-fee', label: 'Variable Closing Fee', required: false, example: '0.00' },
      { key: 'per-item-fee', label: 'Per Item Fee', required: false, example: '0.00' },
      { key: 'fba-fees', label: 'FBA Fees', required: false, example: '1.86' },
      { key: 'other-transaction-fee', label: 'Other Transaction Fee', required: false, example: '0.00' },
      { key: 'other', label: 'Other', required: false, example: '0.00' },
      
      // Shipping Information
      { key: 'ship-service-level', label: 'Ship Service Level', required: false, example: 'Standard' },
      { key: 'recipient-name', label: 'Recipient Name', required: false, example: 'John Doe' },
      { key: 'ship-address-1', label: 'Ship Address 1', required: false, example: '123 Main Street' },
      { key: 'ship-address-2', label: 'Ship Address 2', required: false, example: 'Apt 4B' },
      { key: 'ship-address-3', label: 'Ship Address 3', required: false, example: 'Building A' },
      { key: 'ship-city', label: 'Ship City', required: false, example: 'CHANDIGARH' },
      { key: 'ship-state', label: 'Ship State', required: false, example: 'CHANDIGARH' },
      { key: 'ship-postal-code', label: 'Ship Postal Code', required: false, example: '160101' },
      { key: 'ship-country', label: 'Ship Country', required: false, example: 'IN' },
      { key: 'carrier', label: 'Carrier', required: false, example: 'UPS' },
      { key: 'tracking-number', label: 'Tracking Number', required: false, example: '1Z999AA1234567890' },
      { key: 'ship-date', label: 'Ship Date', required: false, example: '2025-07-31' },
      { key: 'delivery-date', label: 'Delivery Date', required: false, example: '2025-08-03' },
      
      // Business Intelligence
      { key: 'verge-of-cancellation', label: 'Verge of Cancellation', required: false, example: 'false' },
      { key: 'verge-of-lateShipment', label: 'Verge of Late Shipment', required: false, example: 'false' },
      { key: 'is-prime', label: 'Is Prime', required: false, example: 'true' },
      { key: 'is-prime-eligible', label: 'Is Prime Eligible', required: false, example: 'true' },
      { key: 'marketplace', label: 'Marketplace', required: false, example: 'Amazon.com' },
      { key: 'marketplace-id', label: 'Marketplace ID', required: false, example: 'ATVPDKIKX0DER' },
      
      // Additional Fields
      { key: 'merchant-order-id', label: 'Merchant Order ID', required: false, example: 'MO-2024-001' },
      { key: 'merchant-order-item-id', label: 'Merchant Order Item ID', required: false, example: 'MOI-001' },
      { key: 'merchant-adjustment-id', label: 'Merchant Adjustment ID', required: false, example: 'MAI-001' },
      { key: 'merchant-fulfillment-id', label: 'Merchant Fulfillment ID', required: false, example: 'MFI-001' },
      { key: 'merchant-shipping-group-id', label: 'Merchant Shipping Group ID', required: false, example: 'MSGI-001' },
      { key: 'merchant-product-group-id', label: 'Merchant Product Group ID', required: false, example: 'MPGI-001' },
      { key: 'merchant-product-group-name', label: 'Merchant Product Group Name', required: false, example: 'Electronics' },
      { key: 'merchant-product-group-type', label: 'Merchant Product Group Type', required: false, example: 'Category' },
      { key: 'merchant-product-group-id-2', label: 'Merchant Product Group ID 2', required: false, example: 'MPGI-002' },
      { key: 'merchant-product-group-name-2', label: 'Merchant Product Group Name 2', required: false, example: 'Audio' },
      { key: 'merchant-product-group-type-2', label: 'Merchant Product Group Type 2', required: false, example: 'Subcategory' },
      { key: 'merchant-product-group-id-3', label: 'Merchant Product Group ID 3', required: false, example: 'MPGI-003' },
      { key: 'merchant-product-group-name-3', label: 'Merchant Product Group Name 3', required: false, example: 'Headphones' },
      { key: 'merchant-product-group-type-3', label: 'Merchant Product Group Type 3', required: false, example: 'Product' },
      { key: 'merchant-product-group-id-4', label: 'Merchant Product Group ID 4', required: false, example: 'MPGI-004' },
      { key: 'merchant-product-group-name-4', label: 'Merchant Product Group Name 4', required: false, example: 'Wireless' },
      { key: 'merchant-product-group-type-4', label: 'Merchant Product Group Type 4', required: false, example: 'Feature' },
      { key: 'merchant-product-group-id-5', label: 'Merchant Product Group ID 5', required: false, example: 'MPGI-005' },
      { key: 'merchant-product-group-name-5', label: 'Merchant Product Group Name 5', required: false, example: 'Noise Cancelling' },
      { key: 'merchant-product-group-type-5', label: 'Merchant Product Group Type 5', required: false, example: 'Feature' }
    ],
    accept: ['.csv', '.txt', '.tsv', '.tsp', '.xlsx', '.xls', 'text/tab-separated-values', 'text/plain'],
    templateHref: '/templates/sales-template.csv'
  },
  purchase: {
    id: 'purchase',
    title: 'Purchase',
    help: 'Import purchase order data from Amazon.com Business, suppliers, or any procurement system',
    icon: '🛒',
    schema: [
      { key: 'account_group', label: 'Account Group', required: false, example: 'Business Account' },
      { key: 'po_number', label: 'PO Number', required: false, example: 'PO-2024-001' },
      { key: 'order_quantity', label: 'Order Quantity', required: false, example: '100' },
      { key: 'currency', label: 'Currency', required: false, example: 'USD' },
      { key: 'order_subtotal', label: 'Order Subtotal', required: false, example: '1500.00' },
      { key: 'order_shipping', label: 'Order Shipping', required: false, example: '25.00' },
      { key: 'order_promo', label: 'Order Promotion', required: false, example: '50.00' },
      { key: 'order_tax', label: 'Order Tax', required: false, example: '120.00' },
      { key: 'order_net', label: 'Order Net Total', required: false, example: '1595.00' },
      { key: 'order_status', label: 'Order Status', required: false, example: 'Shipped' },
      { key: 'approver', label: 'Approver', required: false, example: 'John Doe' },
      { key: 'account_user', label: 'Account User', required: false, example: 'jane@company.com' },
      { key: 'account_user_email', label: 'Account User Email', required: false, example: 'jane@company.com' },
      { key: 'shipment_date', label: 'Shipment Date', required: false, example: '2024-01-15' },
      { key: 'shipment_status', label: 'Shipment Status', required: false, example: 'Delivered' },
      { key: 'delivery_status', label: 'Delivery Status', required: false, example: 'Delivered' },
      { key: 'expected_delivery', label: 'Expected Delivery', required: false, example: '2024-01-20' },
      { key: 'carrier_tracking', label: 'Carrier Tracking', required: false, example: '1Z999AA1234567890' },
      { key: 'shipment_quantity', label: 'Shipment Quantity', required: false, example: '100' },
      { key: 'shipping_address', label: 'Shipping Address', required: false, example: '123 Main St' },
      { key: 'shipment_subtotal', label: 'Shipment Subtotal', required: false, example: '1500.00' },
      { key: 'shipment_price', label: 'Shipment Price', required: false, example: '15.00' },
      { key: 'shipment_to', label: 'Shipment To', required: false, example: 'New York, NY' },
      { key: 'shipment_name', label: 'Shipment Name', required: false, example: 'John Doe' },
      { key: 'carrier_name', label: 'Carrier Name', required: false, example: 'UPS' },
      { key: 'asin', label: 'ASIN', required: false, example: 'B08N5WRWNW' },
      { key: 'title', label: 'Title', required: false, example: 'Wireless Headphones' },
      { key: 'unspsc', label: 'UNSPSC', required: false, example: '43201500' },
      { key: 'segment', label: 'Segment', required: false, example: 'Electronics' },
      { key: 'family', label: 'Family', required: false, example: 'Audio Equipment' },
      { key: 'class', label: 'Class', required: false, example: 'Headphones' },
      { key: 'commodity', label: 'Commodity', required: false, example: 'Wireless Headphones' },
      { key: 'brand_code', label: 'Brand Code', required: false, example: 'SONY' },
      { key: 'brand', label: 'Brand', required: false, example: 'Sony' },
      { key: 'manufacturer', label: 'Manufacturer', required: false, example: 'Sony Corporation' },
      { key: 'national_stock', label: 'National Stock Number', required: false, example: 'N/A' },
      { key: 'item_model_no', label: 'Item Model Number', required: false, example: 'WH-1000XM4' },
      { key: 'part_number', label: 'Part Number', required: false, example: 'PROD-001' },
      { key: 'product_condition', label: 'Product Condition', required: false, example: 'New' },
      { key: 'company_code', label: 'Company Code', required: false, example: 'COMP001' },
      { key: 'listed_ppu', label: 'Listed PPU', required: false, example: '20.00' },
      { key: 'purchase_ppu', label: 'Purchase PPU', required: false, example: '15.00' },
      { key: 'item_quantity', label: 'Item Quantity', required: false, example: '100' },
      { key: 'item_subtotal', label: 'Item Subtotal', required: false, example: '1500.00' },
      { key: 'item_shipping', label: 'Item Shipping', required: false, example: '25.00' },
      { key: 'item_net_total', label: 'Item Net Total', required: false, example: '1525.00' },
      { key: 'po_line_item', label: 'PO Line Item', required: false, example: 'PO-LINE-001' },
      { key: 'tax_exemption', label: 'Tax Exemption', required: false, example: 'Applied' },
      { key: 'tax_exemption_type', label: 'Tax Exemption Type', required: false, example: 'Resale' },
      { key: 'seller_name', label: 'Seller Name', required: false, example: 'Amazon.com' }
    ],
    accept: ['.csv', '.txt', '.xlsx', '.xls', '.tsv'],
    templateHref: '/templates/purchase-template.csv'
  },
  'international-shipping': {
    id: 'international-shipping',
    title: 'International Shipping',
    help: 'Import explicit links between sales and purchase orders for precise matching',
    icon: '🌍',
    schema: [
      { key: 'sellercentral.amazon.in', label: 'Seller Central Amazon.in', required: true, example: '408-4870009-9733125' },
      { key: 'asin', label: 'ASIN', required: false, example: 'B08JLTDKHS' },
      { key: 'amazon.com', label: 'Amazon.com', required: true, example: '112-1815601-9677016' },
      { key: 'price', label: 'Price', required: false, example: '19.55' },
      { key: 'quantity', label: 'Quantity', required: false, example: '0' },
      { key: 'title', label: 'Title', required: false, example: 'YWLRONG D' }
    ],
    accept: ['.csv', '.txt', '.xlsx'],
    templateHref: '/templates/international-shipping-template.csv'
  },
  glue: {
    id: 'glue',
    title: 'International Shipping (Glue)',
    help: 'Import explicit links between sales and purchase orders for precise matching',
    icon: '🔗',
    schema: [
      { key: 'salesOrderId', label: 'Sales Order ID', required: true, example: '408-4870009-9733125' },
      { key: 'purchaseOrderId', label: 'Purchase Order ID', required: true, example: '112-1815601-9677016' },
      { key: 'asin', label: 'ASIN (Optional)', required: false, example: 'B08JLTDKHS' }
    ],
    accept: ['.csv', '.txt', '.xlsx'],
    templateHref: '/templates/glue-template.csv'
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
