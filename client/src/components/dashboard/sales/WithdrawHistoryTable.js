import React from "react";
import { Button, Table } from "reactstrap";
import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable";

export const WithdrawHistoryTable = ({ withdrawHistory }) => {
  const handleGenerateWithdrawalReport = () => {
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "portrait"; // portrait or landscape

    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);

    // doc.setFontSize(15);

    const title = "Payment History Report";
    const headers = [
      ["Time", "Amount", "Recipient Bank", "Account Name", "Status"],
    ];

    const historyData = withdrawHistory.map((withdrawItem) => [
      moment(withdrawItem?.withdrawaldate).format("MMMM Do YYYY, h:mm:ss a"),
      `${withdrawItem?.amount} (naira)`,
      withdrawItem?.transferrecipient?.bankname,
      withdrawItem?.transferrecipient?.accountname,
      withdrawItem?.status,
    ]);

    doc.text(title, marginLeft, 40);
    doc.autoTable({
      startY: 50,
      head: headers,
      body: historyData,
      headStyles: { fillColor: [71, 110, 250] }, // theme color
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
      },
    });
    doc.save("withrawal-history-report.pdf");
  };

  return (
    <>
      <div className="table-contents">
        <Table className="align-items-center table-flush" responsive>
          <thead>
            <tr>
              <th>Time</th>
              <th>Amount</th>
              <th>Recipient Bank</th>
              <th>Account Name</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            {withdrawHistory.length === 0 ? (
              <>
                <tr className="tr-style">
                  <p className="text-center">No Records Found</p>
                </tr>
              </>
            ) : (
              <>
                {withdrawHistory.map((withdrawItem) => (
                  <tr key={withdrawItem._id} className="tr-style">
                    <td>
                      {moment(withdrawItem?.withdrawaldate).format(
                        "MMMM Do YYYY, h:mm:ss a"
                      )}
                    </td>
                    <td>&#x24;{withdrawItem?.amount_usd}</td>
                    <td>{withdrawItem?.transferrecipient?.bankname}</td>
                    <td>{withdrawItem?.transferrecipient?.accountname}</td>
                    <td>{withdrawItem?.status}</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </Table>

        <div className="view-more-section mt-4 text-center">
          <Button className="btn-view__more">View more</Button>
        </div>

        <div className="download-pdf-section text-center mt-3">
          <Button
            onClick={handleGenerateWithdrawalReport}
            disabled={withdrawHistory.length === 0}
            block
            className="download-pdf__btn"
          >
            Download PDF
          </Button>
        </div>
      </div>
    </>
  );
};

export default WithdrawHistoryTable;
