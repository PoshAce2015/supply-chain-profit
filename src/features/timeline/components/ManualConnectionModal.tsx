import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../app/store';
import { linkOrphanToOrder, unlinkEventFromOrder, createNewOrderFromOrphan } from '../timelineSlice';
import { TimelineEvent } from '../timelineSlice';

interface ManualConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrphan?: TimelineEvent | undefined;
}

export default function ManualConnectionModal({ 
  isOpen, 
  onClose, 
  selectedOrphan 
}: ManualConnectionModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const byOrder = useSelector((state: RootState) => state.timeline?.byOrder ?? {});
  const orphan = useSelector((state: RootState) => state.timeline?.orphan ?? []);
  
  const [selectedOrderKey, setSelectedOrderKey] = useState<string>('');
  const [newOrderKey, setNewOrderKey] = useState<string>('');
  const [action, setAction] = useState<'link' | 'create'>('link');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedOrderKey('');
      setNewOrderKey('');
      setAction('link');
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleLinkToExistingOrder = () => {
    if (!selectedOrphan || !selectedOrderKey) return;
    
    dispatch(linkOrphanToOrder({
      orphanId: selectedOrphan.id,
      orderKey: selectedOrderKey
    }));
    
    onClose();
  };

  const handleCreateNewOrder = () => {
    if (!selectedOrphan || !newOrderKey.trim()) return;
    
    dispatch(createNewOrderFromOrphan({
      orphanId: selectedOrphan.id,
      newOrderKey: newOrderKey.trim()
    }));
    
    onClose();
  };

  const handleUnlinkEvent = (eventId: string, orderKey: string) => {
    dispatch(unlinkEventFromOrder({ eventId, orderKey }));
  };

  // Filter orders by search term
  const filteredOrders = Object.keys(byOrder).filter(orderKey =>
    orderKey.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Manual Connection - Link Events to Orders
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Selected Orphan Event */}
          {selectedOrphan && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Selected Event:</h3>
              <div className="text-sm text-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium uppercase ${
                    selectedOrphan.category === 'sales' ? 'bg-green-100 text-green-700' :
                    selectedOrphan.category === 'purchase' ? 'bg-purple-100 text-purple-700' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {selectedOrphan.category}
                  </span>
                  <span>{selectedOrphan.when || 'No date'}</span>
                </div>
                <div className="text-xs">
                  <strong>ID:</strong> {selectedOrphan.id}
                  {selectedOrphan.raw?.sku && (
                    <span className="ml-4"><strong>SKU:</strong> {selectedOrphan.raw.sku}</span>
                  )}
                  {selectedOrphan.raw?.asin && (
                    <span className="ml-4"><strong>ASIN:</strong> {selectedOrphan.raw.asin}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Selection */}
          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="link"
                  checked={action === 'link'}
                  onChange={(e) => setAction(e.target.value as 'link')}
                  className="mr-2"
                />
                Link to Existing Order
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="create"
                  checked={action === 'create'}
                  onChange={(e) => setAction(e.target.value as 'create')}
                  className="mr-2"
                />
                Create New Order
              </label>
            </div>

            {action === 'link' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Order to Link To:
                </label>
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                />
                
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                  {filteredOrders.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">
                      No orders found
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredOrders.map(orderKey => {
                        const order = byOrder[orderKey];
                        const salesCount = order.events.filter(e => e.category === 'sales').length;
                        const purchaseCount = order.events.filter(e => e.category === 'purchase').length;
                        
                        return (
                          <button
                            key={orderKey}
                            onClick={() => setSelectedOrderKey(orderKey)}
                            className={`w-full p-3 text-left hover:bg-gray-50 ${
                              selectedOrderKey === orderKey ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-900">{orderKey}</div>
                            <div className="text-sm text-gray-500">
                              {order.events.length} events • {salesCount} sales • {purchaseCount} purchases
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {action === 'create' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Order Key:
                </label>
                <input
                  type="text"
                  placeholder="Enter new order key..."
                  value={newOrderKey}
                  onChange={(e) => setNewOrderKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {action === 'link' && selectedOrderKey && (
              <button
                onClick={handleLinkToExistingOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Link to Order
              </button>
            )}
            
            {action === 'create' && newOrderKey.trim() && (
              <button
                onClick={handleCreateNewOrder}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create New Order
              </button>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>

          {/* Orphan Events List */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              All Orphan Events ({orphan.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {orphan.map(ev => (
                <div key={ev.id} className="p-3 border border-gray-200 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium uppercase ${
                      ev.category === 'sales' ? 'bg-green-100 text-green-700' :
                      ev.category === 'purchase' ? 'bg-purple-100 text-purple-700' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {ev.category}
                    </span>
                    <span className="text-sm text-gray-600">{ev.when || 'No date'}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <strong>ID:</strong> {ev.id}
                    {ev.raw?.sku && (
                      <span className="ml-4"><strong>SKU:</strong> {ev.raw.sku}</span>
                    )}
                    {ev.raw?.asin && (
                      <span className="ml-4"><strong>ASIN:</strong> {ev.raw.asin}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
