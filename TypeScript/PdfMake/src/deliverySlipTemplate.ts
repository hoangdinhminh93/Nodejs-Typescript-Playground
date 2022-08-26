import { integer } from "aws-sdk/clients/cloudfront";
import { ContentColumns, TDocumentDefinitions } from "pdfmake/interfaces";

function getFormattedDate(date: Date) {
    return date.toISOString().slice(0, 10)
}

function getSender(senderAddress: string) {
    let result = []
    result.push({ text: 'Absender:\n' })
    let data = senderAddress.split('\n')
    let isName = true

    data.forEach(address => {
        if (isName) {
            result.push({ text: `${address.trim()}\n`, style: 'bold' })
            isName = false
        }

        else {
            result.push({ text: `${address.trim()}\n` })
        }
    })
    return result
}

function getRecipient(name: string, address: string) {
    let result = []

    result.push({ text: 'Empfänger:\n' })

    if (name) {
        result.push({ text: `${name}\n`, style: 'bold' })
    }

    if (address) {
        result.push({ text: `${address}\n` })
    }

    return result
}

function getReturnCenter(name: string) {
    let result = []
    
    result.push({ text: `Fotomuster-Rückläufer\n`, style: 'boldUnderline' })

    result.push({ text: `Lieferschein zur Transporteinheit (TE): ${name}\n` })

    result.push({ text: `Datum: ${getFormattedDate(new Date())}\n` })

    return result
}

function getArticleTable(articles: any) {
    let result = []

    result.push({ text: `Inhalt der Transporteinheit (TE):\n` })

    let tableBody = [];

    // Header of table
    let tableHeader =
        [
            { text: 'GTIN', style: 'tableHeader' },
            { text: 'Artikelname', style: 'tableHeader' },
            { text: 'Artikelfarbe', style: 'tableHeader' },
            { text: 'Artikelgröße', style: 'tableHeader' },
            { text: 'Scan-Datum', style: 'tableHeader' },
            { text: 'Gescannt von', style: 'tableHeader' },
        ]

    tableBody.push(tableHeader)

    // content of table
    for (let i = 0; i < articles.length; i++) {
        let aRow =
            [
                { text: articles[i].Gtin, style: 'tableCell' },
                { text: articles[i].Title, style: 'tableCell' },
                { text: articles[i].Color, style: 'tableCell' },
                { text: articles[i].Size, style: 'tableCell' },
                { text: getFormattedDate(new Date(articles[i].CreatedAt)), style: 'tableCell' },
                { text: getFormattedDate(new Date(articles[i].UpdatedAt)), style: 'tableCell' },
            ]

        tableBody.push(aRow);
    }

    // Define table with columns & contents
    let table = {
        style: 'table',
        table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*', '*'],
            body: tableBody
        }
    }

    result.push(table)

    return result
}

function getStatementOfAuthority(count: integer) {
    let result = []

    result.push({ text: `Anzahl Artikel GESAMT: ${count}\n\n` })

    result.push({ text: `Unterschrift Bearbeiter Fotostudio: _________________________________________________\n\n` })

    result.push({ text: `Bearbeiter Fotostudio (in Druckbuchstaben): ________________________________________` })

    return result
}

export function getTemplateDocDefinition(transportUnit: any, articles: any): TDocumentDefinitions {
    return {
        pageSize: 'A4',

        pageMargins: [50, 100, 50, 50],

        header: function (currentPage, pageCount, pageSize) {
            if (currentPage > 1) {
                return [
                    { text: `Lieferschein zur TE ${transportUnit.Name} vom ${getFormattedDate(new Date())}`, margin: [50, 50, 0, 0], color: 'gray' }
                ]
            }

            return undefined
        },

        footer: function (currentPage, pageCount) {
            return [
                { text: `Seite ${currentPage} von ${pageCount}`, margin: [50, 10, 0, 0] }
            ]
        },

        content: [
            getSender(transportUnit.SenderAddress), '\n',

            getRecipient(transportUnit.ReturnCenterName, transportUnit.ReturnCenterAddress), '\n',

            getReturnCenter(transportUnit.Name), '\n',

            getArticleTable(articles.items), '\n',

            getStatementOfAuthority(articles.items.length)
        ],
        
        defaultStyle: {
            fontSize: 12
        },
        
        styles: {
            bold: {
                bold: true,
            },
            boldUnderline: {
                bold: true,
                decoration: 'underline',
            },
            tableCell: {
                fontSize: 10,
            },
            tableHeader: {
                bold: true,
                fontSize: 10,
            }
        }
    }
}