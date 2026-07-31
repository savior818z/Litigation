(function () {
    'use strict';

    const sections = [
        'CaseInformation',
        'FutureHearings',
        'Parties',
        'DocumentsFiled',
        'PastProceedings',
        'RegisterOfAction'
    ];

    const caseData = {};

    // Helper: normalize text
    const text = (cell) =>
        (cell?.textContent || '')
            .replace(/\s+/g, ' ')
            .trim();

    sections.forEach(name => {
        const anchor = document.querySelector(`a[name="${name}"]`);
        if (!anchor) return;

        // Find the next table with class="dataTable"
        let table = anchor.nextElementSibling;
        while (
            table &&
            (
                table.tagName?.toLowerCase() !== 'table' ||
                !table.classList.contains('dataTable')
            )
        ) {
            table = table.nextElementSibling;
        }

        if (!table) return;

        const rows = table.querySelectorAll('tr');

        if (name === 'CaseInformation') {
            const data = {};

            rows.forEach((row, index) => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 2) return;

                switch (index) {
                    case 0:
                        data["Case Number"] = text(cells[1]);
                        break;
                    case 1:
                        data["Case Title"] = text(cells[1]);
                        break;
                    case 2:
                        data["Filing Courthouse"] = text(cells[1]);
                        break;
                    case 3:
                        data["Filing Date"] = text(cells[1]);
                        break;
                    case 4:
                        data["Case Type"] = text(cells[1]);
                        break;
                    case 5:
                        data["Status"] = text(cells[1]);
                        break;
                }
            });

            caseData[name] = data;
            return;
        }

        caseData[name] = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (!cells.length) return;

            let rowData = {};

            switch (name) {

                case 'FutureHearings':
                    rowData = {
                        date: text(cells[0]),
                        department: text(cells[1]).replace(/department/gi, '').trim(),
                        description: text(cells[2]),
                        result: text(cells[3])
                    };
                    break;

                case 'Parties':
                    rowData = {
                        name: text(cells[0]),
                        role: text(cells[1])
                    };
                    break;

                case 'DocumentsFiled':
                    rowData = {
                        date: text(cells[0]),
                        document: text(cells[1]),
                        filedBy: text(cells[2])
                    };
                    break;

                case 'PastProceedings': {

                    const department = text(cells[1])
                        .replace(/department/gi, '')
                        .trim();

                    const proceeding = text(cells[2]);
                    const result = text(cells[3]);

                    rowData = {
                        date: text(cells[0]),
                        DEPARTMENT: department,
                        Result: result
                    };

                    if (/^Hearing on Motion/i.test(proceeding)) {
                        rowData["Hearing on Motion"] = proceeding.replace(/^Hearing on Motion\s*/i, '').trim();

                    } else if (/^Hearing on Application/i.test(proceeding)) {
                        rowData["Hearing on Application"] = proceeding.replace(/^Hearing on Application\s*/i, '').trim();

                    } else if (/^Final Status/i.test(proceeding)) {
                        rowData.Status = proceeding.replace(/^Final Status\s*/i, '').trim();

                    } else if (/^Order to Show Cause/i.test(proceeding)) {
                        rowData.Order = proceeding.replace(/^Order\s*/i, '').trim();

                    } else if (/^Court Order/i.test(proceeding)) {
                        rowData["Court Order"] = proceeding.replace(/^Court Order\s*/i, '').trim();

                    } else if (/^Non-Appearance/i.test(proceeding)) {
                        rowData["Non-Appearance"] = proceeding.replace(/^Non-Appearance\s*/i, '').trim();

                    } else {
                        rowData.Motion = proceeding;
                    }

                    break;
                }

                case 'RegisterOfAction':
                    rowData = {
                        date: text(cells[0]),
                        action: text(cells[1])
                    };
                    break;
            }

            caseData[name].push(rowData);
        });
    });

    console.log('Structured Case Data:', caseData);

    // Optional: copy to clipboard
    // navigator.clipboard.writeText(JSON.stringify(caseData, null, 2));

})();
