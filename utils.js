export default function createTable(data) {
    // Extract column headers from the data
    const columns = Object.keys(data[0]);

    // Determine the maximum length of each column
    const columnWidths = {};
    columns.forEach((column) => {
        columnWidths[column] = Math.max(
            column.length,
            ...data.map((row) => (row[column] || '').toString().length)
        );
    });

    // Generate the table
    let table = '';

    // Generate the table header
    columns.forEach((column, index) => {
        if (index === 0) {
            table += '\ntitle'.padEnd(columnWidths[column] + 2); // Add 2 for spacing
        } else {
            table += '\t' + column.padEnd(columnWidths[column] + 2); // Add 2 for spacing
        }
    });
    table += '\n\n';

    // Generate the table rows
    data.forEach((row) => {
        columns.forEach((column, index) => {
            const cell = (row[column] || '').toString();
            if (index === 0) {
                table += cell.padEnd(columnWidths[column]); // Add 2 for spacing
            } else {
                table += '\t' + cell.padEnd(columnWidths[column]); // Add 2 for spacing
            }
        });
        table += '\n'; // Move to the next row
    });

    return table;
}
