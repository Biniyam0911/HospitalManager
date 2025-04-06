import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface PrintPrescriptionProps {
  patient: any;
  order: any;
  doctor: any;
  hospital?: {
    name: string;
    address: string;
    phone: string;
    logo?: string;
  };
}

const PrintPrescription: React.FC<PrintPrescriptionProps> = ({
  patient,
  order,
  doctor,
  hospital = {
    name: "Hospital ERP System",
    address: "123 Healthcare Ave, Medical District",
    phone: "(123) 456-7890"
  }
}) => {
  // Function to handle printing the prescription
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Prescription #${order.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
              line-height: 1.5;
            }
            .prescription {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #ddd;
              padding: 30px;
              position: relative;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #2196F3;
              padding-bottom: 15px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2196F3;
              margin-bottom: 5px;
            }
            .hospital-info {
              font-size: 14px;
              color: #555;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-weight: bold;
              font-size: 16px;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            .patient-info, .doctor-info {
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
            }
            .patient-info > div, .doctor-info > div {
              flex: 0 0 48%;
              margin-bottom: 10px;
            }
            .title {
              color: #2196F3;
              font-weight: bold;
            }
            .prescription-details {
              margin: 20px 0;
              border: 1px solid #eee;
              padding: 15px;
              border-radius: 4px;
            }
            .rx-symbol {
              font-size: 24px;
              color: #555;
              margin-right: 10px;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .signature {
              margin-top: 60px;
              border-top: 1px solid #000;
              width: 200px;
              text-align: center;
              padding-top: 5px;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 100px;
              color: rgba(33, 150, 243, 0.05);
              z-index: -1;
              pointer-events: none;
            }
            .dosage-info {
              font-size: 16px;
              font-weight: bold;
              margin: 10px 0;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="prescription">
            <div class="watermark">PRESCRIPTION</div>
            <div class="header">
              <div class="logo">${hospital.name}</div>
              <div class="hospital-info">
                ${hospital.address}<br>
                ${hospital.phone}
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Patient Information</div>
              <div class="patient-info">
                <div><span class="title">Name:</span> ${patient.firstName} ${patient.lastName}</div>
                <div><span class="title">ID:</span> ${patient.patientId}</div>
                <div><span class="title">Age:</span> ${patient.age || 'N/A'}</div>
                <div><span class="title">Gender:</span> ${patient.gender || 'N/A'}</div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Prescription Details</div>
              <div class="prescription-details">
                <div><span class="rx-symbol">Rx</span></div>
                
                <div class="medication">
                  <div><strong>${order.name}</strong></div>
                  <div class="dosage-info">${order.dosage || 'As directed'} - ${order.route || 'N/A'}</div>
                  <div><strong>Instructions:</strong> ${order.instructions}</div>
                  <div><strong>Frequency:</strong> ${order.frequency || 'As directed'}</div>
                  <div><strong>Duration:</strong> ${order.duration ? order.duration + ' days' : 'As directed'}</div>
                  ${order.notes ? `<div><strong>Notes:</strong> ${order.notes}</div>` : ''}
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Prescriber Information</div>
              <div class="doctor-info">
                <div><span class="title">Doctor:</span> Dr. ${doctor.name || doctor.username || 'N/A'}</div>
                <div><span class="title">License #:</span> ${doctor.licenseNumber || 'N/A'}</div>
                <div><span class="title">Date:</span> ${formatDate(new Date().toISOString())}</div>
              </div>
            </div>
            
            <div class="footer">
              <div class="signature">
                Doctor's Signature
              </div>
              <div>
                <div style="text-align: right; margin-top: 40px;">
                  <strong>Prescription #:</strong> ${order.id}<br>
                  <strong>Date:</strong> ${formatDate(order.orderDate)}
                </div>
              </div>
            </div>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()">Print Prescription</button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Focus the new window and print after content is loaded
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Only render the print button if this is a medication order
  if (order.orderType !== 'medication') {
    return null;
  }

  return (
    <Button 
      onClick={handlePrint} 
      variant="outline" 
      size="sm" 
      className="mt-2"
    >
      <Printer className="h-4 w-4 mr-2" />
      Print Prescription
    </Button>
  );
};

export default PrintPrescription;