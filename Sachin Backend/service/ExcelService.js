const excel = require("exceljs");
/**
 *
 * @param {recordeset Arr} data
 * quary example `Select Extn_No AS 'Extension Number'//this will be column headers in Excel , Extn_Name AS 'Extension Name' from Extension`
 * @param {} res
 */
async function downloadAsExcel(data, res) {
  var cellArr = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "AA",
    "AB",
    "AC",
    "AD",
    "AE",
    "AF",
    "AG",
    "AH",
    "AI",
    "AJ",
    "AK",
    "AL",
    "AM",
    "AN",
    "AO",
    "AP",
    "AQ",
    "AR",
    "AS",
    "AT",
    "AU",
    "AV",
    "AW",
    "AX",
    "AY",
    "AZ",
    "BA",
    "BB",
    "BC",
    "BD",
    "BE",
    "BF",
    "BG",
    "BH",
    "BI",
    "BJ",
    "BK",
    "BL",
    "BM",
    "BN",
    "BO",
    "BP",
    "BQ",
    "BR",
    "BS",
    "BT",
    "BU",
    "BV",
    "BW",
    "BX",
    "BY",
    "BZ",
    "CA",
    "CB",
    "CC",
    "CD",
    "CE",
    "CF",
    "CG",
    "CH",
    "CI",
    "CJ",
    "CK",
    "CL",
    "CM",
    "CN",
    "CO",
    "CP",
    "CQ",
    "CR",
    "CS",
    "CT",
    "CU",
    "CV",
    "CW",
    "CX",
    "CY",
    "CZ"
  ];
  // Create a new Excel workbook
  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet("Social media engagement report"); //Worksheet Name
  // Add data to the worksheet
  if (data && data.length) {
    const originalColumns = Object.keys(data[0]);
    worksheet.columns = originalColumns.map((column) => ({
      header: column,
      key: column,
      width: column.length + 5
    }));
    worksheet.addRows(data);
    const rowVal = worksheet.getRow(1);
    rowVal.height = 20;
    for (let i = 0; i < originalColumns.length; i++) {
      worksheet.getCell(`${cellArr[i]}1`).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "3B82F6" }
      };
      worksheet.getCell(`${cellArr[i]}1`).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
      worksheet.getCell(`${cellArr[i]}1`).font = {
        bold: true,
        color: { argb: "ffffffff" },
        size: 10
      };
      worksheet.getCell(`${cellArr[i]}1`).alignment = {
        vertical: "middle",
        horizontal: "left"
      };
    }
  } else {
    worksheet.addRow(["No records found"]);
  }
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "CommentData" + ".xlsx"
  );
  try {
    // Pipe the Excel workbook to the response
    workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
}

module.exports.downloadAsExcel = downloadAsExcel;
