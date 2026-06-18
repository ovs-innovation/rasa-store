import React from 'react';
import { 
  FiCheckCircle, FiPackage, FiTruck, FiHome, FiClock, 
  FiExternalLink, FiMapPin, FiCalendar, FiShoppingBag, 
  FiAlertCircle, FiXCircle, FiCreditCard 
} from 'react-icons/fi';

const OrderTracking = ({ order }) => {
  if (!order) return null;

  const steps = [
    { status: 'Order Placed', icon: FiShoppingBag, color: 'text-blue-500', bg: 'bg-blue-100', dot: 'bg-blue-500' },
    { status: 'Pending', icon: FiClock, color: 'text-amber-500', bg: 'bg-amber-100', dot: 'bg-amber-500' },
    { status: 'Scheduled', icon: FiCalendar, color: 'text-indigo-500', bg: 'bg-indigo-100', dot: 'bg-indigo-500' },
    { status: 'Accepted', icon: FiCheckCircle, color: 'text-cyan-500', bg: 'bg-cyan-100', dot: 'bg-cyan-500' },
    { status: 'Processing', icon: FiPackage, color: 'text-orange-500', bg: 'bg-orange-100', dot: 'bg-orange-500' },
    { status: 'Order On The Way', icon: FiTruck, color: 'text-purple-500', bg: 'bg-purple-100', dot: 'bg-purple-500' },
    { status: 'Delivered', icon: FiHome, color: 'text-emerald-500', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  ];

  const currentStatus = order.status;
  const statusHistory = order.statusHistory || order.trackingHistory || [];
  const shipmentStatus = order.shipmentStatus || order.shiprocket?.status;

  // Find the highest completed step index
  const getStatusIndex = (status) => {
    if (!status) return -1;
    // Map legacy statuses to new ones for index finding
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'outfordelivery') return steps.findIndex(s => s.status === 'Order On The Way');
    if (normalizedStatus === 'cancel' || normalizedStatus === 'cancelled') return -2; // Special case
    
    return steps.findIndex(s => s.status.toLowerCase() === normalizedStatus);
  };

  const currentIndex = getStatusIndex(currentStatus);
  const isCancelled = currentStatus?.toLowerCase().includes('cancel');
  const isFailed = currentStatus?.toLowerCase().includes('failed');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Shipment Timeline</h3>
          <p className="text-xs text-gray-500 mt-0.5">Real-time updates for your order</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 ${
          isCancelled || isFailed ? 'bg-red-500 text-white' : 'bg-store-500 text-white'
        }`}>
          {isCancelled ? <FiXCircle /> : isFailed ? <FiAlertCircle /> : <FiTruck className="animate-bounce" />}
          {shipmentStatus || currentStatus}
        </div>
      </div>

      <div className="p-6">
        {/* Quick Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
           {order.courierName && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-store-200 transition-all">
                <p className="text-[10px] text-gray-400 uppercase font-black mb-1.5 tracking-widest">Courier Partner</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <FiTruck className="text-store-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-800">{order.courierName}</p>
                </div>
              </div>
            )}
            {order.trackingNumber && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-store-200 transition-all">
                <p className="text-[10px] text-gray-400 uppercase font-black mb-1.5 tracking-widest">AWB Number</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <FiPackage className="text-store-500" />
                  </div>
                  <p className="text-sm font-mono font-bold text-gray-800">{order.trackingNumber}</p>
                </div>
              </div>
            )}
            {order.estimatedDeliveryDate && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 group hover:border-emerald-200 transition-all">
                <p className="text-[10px] text-emerald-600 uppercase font-black mb-1.5 tracking-widest">Est. Delivery</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <FiCalendar className="text-emerald-500" />
                  </div>
                  <p className="text-sm font-bold text-emerald-800">
                    {new Date(order.estimatedDeliveryDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
            {order.currentLocation && (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 group hover:border-blue-200 transition-all">
                <p className="text-[10px] text-blue-600 uppercase font-black mb-1.5 tracking-widest">Current Location</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <FiMapPin className="text-blue-500" />
                  </div>
                  <p className="text-sm font-bold text-blue-800 truncate">{order.currentLocation}</p>
                </div>
              </div>
            )}
        </div>

        {isCancelled ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
            <FiXCircle className="text-5xl text-red-500 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-red-800">Order Cancelled</h4>
            <p className="text-sm text-red-600 mt-2 max-w-md mx-auto">
              This order has been cancelled. If you have any questions, please contact our support team.
            </p>
          </div>
        ) : (
          <div className="relative pl-2">
            {/* Vertical Line */}
            <div className="absolute left-[29px] top-4 bottom-4 w-1 bg-gray-100 rounded-full"></div>

            <div className="space-y-12">
              {steps.map((step, index) => {
                const stepStatus = step.status.toLowerCase();
                const historyItem = statusHistory.find(h => 
                  (h.status || h.activity)?.toLowerCase() === stepStatus ||
                  (stepStatus === 'order on the way' && (h.status || h.activity)?.toLowerCase() === 'outfordelivery')
                );
                
                const isCompleted = index <= currentIndex || historyItem;
                const isCurrent = index === currentIndex;

                return (
                  <div key={index} className="relative flex items-start gap-8 group">
                    {/* Step Icon */}
                    <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm border-2 ${
                      isCompleted 
                        ? `${step.bg} ${step.color} border-white ring-4 ring-offset-2 ring-gray-50` 
                        : 'bg-white text-gray-300 border-gray-100'
                    } ${isCurrent ? 'scale-110 shadow-lg border-store-200' : ''}`}>
                      <step.icon className={`text-2xl ${isCurrent ? 'animate-pulse' : ''}`} />
                      {isCompleted && !isCurrent && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                          <FiCheckCircle className="text-white text-xs" />
                        </div>
                      )}
                      {isCurrent && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-store-500 rounded-full border-2 border-white animate-ping"></span>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 pt-1.5">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div className="max-w-md">
                          <h4 className={`text-base font-bold transition-all duration-300 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.status}
                          </h4>
                          <p className={`text-sm mt-1 leading-relaxed ${isCompleted ? 'text-gray-600 font-medium' : 'text-gray-300'}`}>
                            {historyItem?.note || historyItem?.message || (isCompleted ? 'Step completed successfully' : 'Pending update')}
                          </p>
                          {historyItem?.location && (
                             <p className="text-[11px] text-store-600 font-black mt-2 flex items-center gap-1.5 bg-store-50 px-2 py-1 rounded-md w-fit uppercase">
                                <FiMapPin className="text-[11px]" /> {historyItem.location}
                             </p>
                          )}
                        </div>
                        {historyItem && (
                          <div className="sm:text-right mt-1 sm:mt-0 bg-white sm:bg-transparent p-2 rounded-xl sm:p-0 border border-gray-50 sm:border-0 shadow-sm sm:shadow-none">
                            <p className="text-xs font-black text-gray-900 flex items-center sm:justify-end gap-1.5">
                              <FiCalendar className="text-store-500" />
                              {new Date(historyItem.updatedAt || historyItem.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-xs text-gray-500 font-bold mt-0.5 flex items-center sm:justify-end gap-1.5">
                              <FiClock className="text-store-400" />
                              {new Date(historyItem.updatedAt || historyItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Connecting line highlight */}
                    {isCompleted && index < steps.length - 1 && (
                      <div className="absolute left-[29px] top-14 h-12 w-1 bg-store-500 rounded-full z-0"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* External Link */}
        {order.trackingUrl && (
          <div className="mt-12 pt-8 border-t border-gray-50 text-center">
            <a 
              href={order.trackingUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-store-600 text-white rounded-2xl text-sm font-black hover:bg-store-700 transition-all shadow-xl hover:shadow-store-200/50 hover:-translate-y-1"
            >
              <FiTruck className="text-lg" /> Track on Official Website <FiExternalLink />
            </a>
            <p className="text-[10px] text-gray-400 mt-4 uppercase font-bold tracking-widest">Powered by Rasa Store Logistics</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;

