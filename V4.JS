(function () {
    'use strict';

    const caseData = {
        metadata: {
            scrapedAt: new Date().toISOString(),
            source: location.href
        },
        sections: {}
    };


    const getText = (element) =>
        (element?.textContent || '')
            .replace(/\s+/g, ' ')
            .trim();


    const getLinks = (element) =>
        [...(element?.querySelectorAll('a') || [])].map(a => ({
            text: getText(a),
            href: a.href
        }));


    const cleanDepartment = (value) =>
        value
            .replace(/department/gi, '')
            .replace(/\s+/g, ' ')
            .trim();



    const getSectionTable = (anchor) => {

        let next = anchor.nextElementSibling;

        while (next) {

            if (next.tagName?.toLowerCase() === 'table') {
                return next;
            }

            next = next.nextElementSibling;
        }

        return null;
    };



    document.querySelectorAll('a[name]').forEach(anchor => {


        const sectionName = anchor.getAttribute('name');

        const table = getSectionTable(anchor);


        if (!table) {
            caseData.sections[sectionName] = {
                recordCount: 0,
                records: []
            };
            return;
        }



        const records = [];



        table.querySelectorAll('tr').forEach(row => {


            const cells = [...row.querySelectorAll('td, th')];

            if (!cells.length) return;


            const values = cells.map(c => getText(c));


            let record = {};



            switch (sectionName) {


                case "CaseInformation":

                    if (values.length >= 2) {

                        const label =
                            values[0]
                            .replace(':','')
                            .trim()
                            .replace(/\s+/g,'');

                        record[label] = values[1];

                    }

                    break;



                case "FutureHearings":

                    record = {
                        date: values[0] || "",
                        time: values[1] || "",
                        DEPARTMENT: cleanDepartment(values[2] || ""),
                        location: values[3] || "",
                        hearing: values[4] || ""
                    };

                    break;



                case "Parties":

                    record = {
                        name: values[0] || "",
                        role: values[1] || ""
                    };

                    break;



                case "DocumentsFiled":

                    record = {
                        date: values[0] || "",
                        document: values[1] || "",
                        filedBy: values[2] || ""
                    };

                    break;



                case "PastProceedings":

                    record = {
                        date: values[0] || "",
                        DEPARTMENT: cleanDepartment(values[1] || ""),
                        proceeding: values[2] || "",
                        result: values[3] || ""
                    };

                    break;



                case "RegisterOfAction":

                    record = {
                        date: values[0] || "",
                        action: values[1] || ""
                    };

                    break;



                default:

                    values.forEach((value,index)=>{

                        record[`column_${index+1}`] = value;

                    });

            }



            // Add hyperlinks
            cells.forEach((cell,index)=>{

                const links = getLinks(cell);

                if (links.length) {

                    record[`column_${index+1}_links`] = links;

                }

            });



            records.push(record);

        });



        caseData.sections[sectionName] = {
            recordCount: records.length,
            records
        };


    });



    console.log(
        "Structured Case Data:",
        caseData
    );


    // Copy JSON
    // navigator.clipboard.writeText(JSON.stringify(caseData,null,2));


})();
