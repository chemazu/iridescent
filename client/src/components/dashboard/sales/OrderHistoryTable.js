import React from "react";
import { Button, Table } from "reactstrap";
import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable";

const OrderHistoryTable = ({ purchaseHistory }) => {
  const handleDownloadPdf = () => {
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "portrait"; // portrait or landscape

    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);

    // doc.setFontSize(15);

    const title = "Payment History Report";
    const headers = [["Time", "Name", "Email", "Amount", "Course Paid"]];

    const historyData = purchaseHistory.map((historyItem) => [
      moment(historyItem.orderdate).format("MMMM Do YYYY, h:mm:ss a"),
      `${historyItem?.orderfrom?.firstname} ${historyItem?.orderfrom?.lastname}`,
      historyItem?.orderfrom?.email,
      `${historyItem?.actualearning} (naira)`,
      historyItem?.orderedcourse?.title,
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
    doc.save("payment-history-report.pdf");
  };

  return (
    <>
      <div className="table-contents">
        <Table className="align-items-center table-flush" responsive>
          <thead>
            <tr>
              <th>Time</th>
              <th>Name</th>
              <th>Email</th>
              <th>Amount</th>
              <th>Course Paid</th>
            </tr>
          </thead>
          <tbody>
            {purchaseHistory.length === 0 ? (
              <>
                <tr className="tr-style">
                  <p className="text-center">No Records Found</p>
                </tr>
              </>
            ) : (
              <>
                {purchaseHistory.map((historyItem) => (
                  <tr key={historyItem._id} className="tr-style">
                    <td>
                      {moment(historyItem.orderdate).format(
                        "MMMM Do YYYY, h:mm:ss a"
                      )}
                    </td>
                    <td>{`${historyItem?.orderfrom?.firstname} ${historyItem?.orderfrom?.lastname}`}</td>
                    <td>{historyItem?.orderfrom?.email}</td>
                    <td>&#x24;{historyItem?.actualearning_usd}</td>
                    <td>{historyItem?.orderedcourse?.title}</td>
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
            disabled={purchaseHistory.length === 0}
            onClick={handleDownloadPdf}
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

export default OrderHistoryTable;
