const { createTransporter } = require('../config/email');

const resolveAppointmentDate = (appointment = {}) => {
  if (appointment.timeSlot && appointment.timeSlot.date) {
    return new Date(appointment.timeSlot.date).toLocaleDateString();
  }
  if (appointment.date) {
    return new Date(appointment.date).toLocaleDateString();
  }
  return 'TBD';
};

const resolveAppointmentTime = (appointment = {}) => {
  if (appointment.timeSlot && appointment.timeSlot.startTime) {
    const endPart = appointment.timeSlot.endTime ? ` - ${appointment.timeSlot.endTime}` : '';
    return `${appointment.timeSlot.startTime}${endPart}`;
  }
  if (appointment.time) {
    return appointment.time;
  }
  return 'TBD';
};

const buildMailOptions = (appointment, userEmail, providerName, serviceName, status, heading, body) => {
  const statusColor = status === 'Confirmed' ? '#28a745' : status === 'Cancelled' ? '#dc3545' : '#007bff';
  return {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Appointment ${status} - ${serviceName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${statusColor};">${heading}</h2>
        <p>Dear Customer,</p>
        <p>${body}</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Appointment Details:</h3>
          <p><strong>Service:</strong> ${serviceName}</p>
          <p><strong>Provider:</strong> ${providerName}</p>
          <p><strong>Date:</strong> ${resolveAppointmentDate(appointment)}</p>
          <p><strong>Time:</strong> ${resolveAppointmentTime(appointment)}</p>
          <p><strong>Status:</strong> <span style="color: ${statusColor};">${status}</span></p>
          ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
        </div>
        <p>Best regards,<br>Appointment Scheduler Team</p>
      </div>
    `
  };
};

const sendAppointmentConfirmation = async (appointment, userEmail, providerName, serviceName) => {
  try {
    const transporter = createTransporter();
    const mailOptions = buildMailOptions(
      appointment,
      userEmail,
      providerName,
      serviceName,
      'Confirmed',
      'Appointment Confirmed!',
      'Your appointment has been confirmed by the service provider.'
    );
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};

const sendAppointmentCancellation = async (appointment, userEmail, providerName, serviceName) => {
  try {
    const transporter = createTransporter();
    const mailOptions = buildMailOptions(
      appointment,
      userEmail,
      providerName,
      serviceName,
      'Cancelled',
      'Appointment Cancelled',
      "We're sorry to inform you that your appointment has been cancelled by the service provider."
    );
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    throw error;
  }
};

const sendAppointmentCompletion = async (appointment, userEmail, providerName, serviceName) => {
  try {
    const transporter = createTransporter();
    const mailOptions = buildMailOptions(
      appointment,
      userEmail,
      providerName,
      serviceName,
      'Completed',
      'Appointment Completed',
      'Your appointment has been marked as completed by the service provider.'
    );
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending completion email:', error);
    throw error;
  }
};

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
  sendAppointmentCompletion
};