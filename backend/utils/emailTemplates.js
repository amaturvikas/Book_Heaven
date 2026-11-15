const getPasswordResetTemplate = (name, resetUrl, role, options = {}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; -webkit-text-size-adjust: 100%; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
    .content { padding: 32px 24px; }
    .button { display: inline-block; background-color: #15803d; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; min-height: 48px; box-sizing: border-box; }
    .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }
    .note { font-size: 13px; color: #64748b; margin-top: 20px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Book Heaven</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${name}</strong>,</p>
      <p>We received a request to reset your password for your <strong>Book Heaven</strong> (${role}) account.</p>
      <p>Click the button below to reset your password. This link is valid for <strong>15 minutes</strong>:</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button" target="_blank">Reset Your Password</a>
      </div>
      <p class="note">If you did not request this, please ignore this email or contact support if you suspect unauthorized activity. Your password will remain unchanged.</p>
      <p class="note" style="word-break: break-all;">Direct link: <a href="${resetUrl}">${resetUrl}</a></p>

      ${!options.isProduction && (options.lanUrl || options.localUrl) ? `
        <div style="margin-top: 22px; padding: 14px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; line-height: 1.6; text-align: left;">
          <strong style="color: #0f172a;">🛠 Development Device Testing Links:</strong>
          ${options.lanUrl ? `<div style="margin-top: 6px; word-break: break-all;">📱 <strong>Mobile (on same Wi-Fi):</strong> <a href="${options.lanUrl}">${options.lanUrl}</a></div>` : ''}
          ${options.localUrl ? `<div style="margin-top: 6px; word-break: break-all;">💻 <strong>Laptop Browser:</strong> <a href="${options.localUrl}">${options.localUrl}</a></div>` : ''}
        </div>
      ` : ''}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Book Heaven. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const getPasswordChangedTemplate = (name, role) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
    .content { padding: 32px 24px; }
    .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Book Heaven</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${name}</strong>,</p>
      <p>This is a confirmation that the password for your <strong>Book Heaven</strong> (${role}) account has been successfully changed.</p>
      <p>If you made this change, you can safely disregard this message.</p>
      <p style="color: #b91c1c; font-weight: 500;">If you did NOT make this change, please contact administrator support immediately.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Book Heaven. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const getOrderConfirmationTemplate = (order) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; }
    .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
    .content { padding: 32px 24px; }
    .order-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 16px 0; }
    .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Book Heaven - Order Confirmed</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${order.customerName}</strong>,</p>
      <p>Thank you for purchasing with Book Heaven! Your order <strong>#${order.orderNumber}</strong> has been received and is being processed.</p>
      <div class="order-box">
        <p><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod} (${order.paymentStatus})</p>
        <p><strong>Delivery Address:</strong> ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}</p>
      </div>
      <p>You can track the progress of your delivery directly in your Book Heaven account under <strong>My Orders</strong>.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Book Heaven. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const getRentalConfirmationTemplate = (rental) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; }
    .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
    .content { padding: 32px 24px; }
    .order-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 16px 0; }
    .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Book Heaven - Book Rental Confirmed</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${rental.customerName}</strong>,</p>
      <p>Your rental order <strong>#${rental.rentalNumber}</strong> for <em>${rental.bookSnapshot.title}</em> has been confirmed!</p>
      <div class="order-box">
        <p><strong>Rental Duration:</strong> ${rental.rentalDays} Days</p>
        <p><strong>Daily Fee:</strong> ₹${rental.dailyFee}/day</p>
        <p><strong>Total Paid:</strong> ₹${rental.totalPaid.toFixed(2)}</p>
        <p><strong>Status:</strong> ${rental.status}</p>
      </div>
      <p>A delivery agent will deliver your book soon. Once delivered, your rental period will begin!</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Book Heaven. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const getDeliveryStatusTemplate = (delivery, newStatus, notes) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; }
    .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
    .content { padding: 32px 24px; }
    .status-badge { display: inline-block; background: #15803d; color: #fff; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 14px; }
    .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Book Heaven - Delivery Update</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${delivery.customerName}</strong>,</p>
      <p>There is an update on your delivery <strong>#${delivery.deliveryNumber}</strong> (${delivery.type}):</p>
      <p>Current Status: <span class="status-badge">${newStatus}</span></p>
      ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
      <p>Delivery Address: ${delivery.deliveryAddress.street}, ${delivery.deliveryAddress.city}</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Book Heaven. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = {
  getPasswordResetTemplate,
  getPasswordChangedTemplate,
  getOrderConfirmationTemplate,
  getRentalConfirmationTemplate,
  getDeliveryStatusTemplate
};
