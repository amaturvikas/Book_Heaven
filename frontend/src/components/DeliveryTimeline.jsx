import React from 'react';
import { CheckCircle2, Clock, Truck, Package, AlertCircle } from 'lucide-react';

const DeliveryTimeline = ({ delivery }) => {
  if (!delivery) return null;

  const steps = [
    { key: 'PendingAssignment', label: 'Order / Request Created', icon: Clock },
    { key: 'Assigned', label: 'Delivery Boy Assigned', icon: Package },
    { key: 'PickedUp', label: 'Package Picked Up', icon: Truck },
    { key: 'OutForDelivery', label: 'Out for Delivery', icon: Truck },
    { key: 'Delivered', label: 'Completed / Delivered', icon: CheckCircle2 }
  ];

  const currentStatus = delivery.status;
  const isFailed = currentStatus === 'Failed';

  // Determine which step index the delivery has reached
  const statusOrder = ['PendingAssignment', 'Assigned', 'PickedUp', 'OutForDelivery', 'Delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="surface-card p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <span className="text-muted small">Tracking Number:</span>
          <h5 className="mb-0 fw-bold">{delivery.deliveryNumber}</h5>
        </div>
        <div>
          <span className={`badge status-badge-${delivery.status} px-3 py-2 rounded-pill font-weight-bold`}>
            {delivery.status}
          </span>
        </div>
      </div>

      {/* Visual Step Tracker */}
      <div className="timeline-track mb-4">
        {steps.map((step, idx) => {
          const isPassed = !isFailed && currentIndex >= idx;
          const isCurrent = !isFailed && currentIndex === idx;

          return (
            <div key={step.key} className={`timeline-step ${isPassed ? 'active' : ''}`}>
              <div className="timeline-indicator"></div>
              <div>
                <h6 className={`mb-1 fw-bold ${isCurrent ? 'text-success' : isPassed ? 'text-dark' : 'text-muted'}`}>
                  {step.label}
                </h6>
                {/* Find timeline event matching this status */}
                {delivery.timeline &&
                  delivery.timeline
                    .filter((ev) => ev.status === step.key)
                    .map((ev, eIdx) => (
                      <div key={eIdx} className="small text-muted">
                        <span>{new Date(ev.timestamp).toLocaleString()}</span>
                        {ev.actor && <span className="ms-1">({ev.actor.role}: {ev.actor.name})</span>}
                        {ev.notes && <div className="text-secondary fst-italic mt-1">{ev.notes}</div>}
                      </div>
                    ))}
              </div>
            </div>
          );
        })}

        {/* If Failed state */}
        {isFailed && (
          <div className="timeline-step failed">
            <div className="timeline-indicator"></div>
            <div>
              <h6 className="mb-1 fw-bold text-danger d-flex align-items-center gap-1">
                <AlertCircle size={16} /> Delivery Attempt Failed
              </h6>
              {delivery.failedTimestamp && (
                <div className="small text-muted">
                  {new Date(delivery.failedTimestamp).toLocaleString()}
                </div>
              )}
              {delivery.failureReason && (
                <div className="alert alert-danger py-2 px-3 small mt-2">
                  <strong>Reason:</strong> {delivery.failureReason}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Assigned Agent Details if available */}
      {delivery.assignedDeliveryBoy && (
        <div className="bg-light p-3 rounded-3 border d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <span className="small text-muted d-block">Assigned Delivery Agent:</span>
            <span className="fw-bold">{delivery.assignedDeliveryBoy.name}</span>
            <span className="text-muted small ms-2">({delivery.assignedDeliveryBoy.phone})</span>
          </div>
          {delivery.assignedDeliveryBoy.vehicleDetails && (
            <div className="small text-muted">
              Vehicle: {delivery.assignedDeliveryBoy.vehicleDetails.vehicleType}
              {delivery.assignedDeliveryBoy.vehicleDetails.vehicleNumber ? ` (${delivery.assignedDeliveryBoy.vehicleDetails.vehicleNumber})` : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryTimeline;
