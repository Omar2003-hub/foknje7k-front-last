import React from "react";

interface TableColumn {
  Header: string;
  accessor: string;
}

interface TableData {
  [key: string]: any; // Allow any data type for flexibility
}

interface CustomTableProps {
  columns: TableColumn[];
  data: TableData[];
  actions?: (row: TableData) => React.ReactNode;
  status?: (row: TableData) => React.ReactNode;
  title?: string;
  statusName?: string;
}

const getNestedValue = (obj: TableData, accessor: string) => {
  return accessor.split(".").reduce((acc, key) => acc?.[key], obj);
};

const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch (_) {
    return false;
  }
};

const isImageUrl = (url: string) => {
  return /\.(jpeg|jpg|png|svg)$/.test(url);
};

const CustomTable: React.FC<CustomTableProps> = ({
  columns,
  data,
  actions,
  status,
  title,
  statusName = "Image",
}) => {
  return (
    <div className="bg-white p-10 mb-10 rounded-xl overflow-x-auto w-full max-h-[80vh]">
      <p className="text-lg font-montserrat_medium text-title mb-7">{title}</p>
      <div>
        <table className="w-full bg-white">
          <thead>
            <tr className="border border-gray-300 bg-tableHeader">
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  className="p-3 text-xs text-center border border-gray-300 md:font-montserrat_medium font-montserrat_regular whitespace-nowrap lg:text-base md:text-sm"
                >
                  {column.Header}
                </th>
              ))}
              {status && (
                <th className="p-3 text-xs text-center border border-gray-300 md:font-montserrat_medium font-montserrat_regular whitespace-nowrap lg:text-base md:text-sm">
                  {statusName}
                </th>
              )}
              {actions && (
                <th className="p-3 md:font-montserrat_medium font-montserrat_regular text-center border border-gray-300 lg:text-base md:text-sm text-xs min-w-[280px]">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-300">
                {columns.map((column) => {
                  const value = getNestedValue(row, column.accessor);
                  return (
                    <td
                      key={column.accessor}
                      className="p-3 text-xs text-center border border-gray-300 font-montserrat_regular lg:text-base md:text-sm"
                    >
                      {/* Content logic */}
                      {(() => {
                        if (column.accessor === "endDate") {
                          return value?.slice(0, 10);
                        } else if (column.accessor === "isSubscriptionActive") {
                          // Debug: log the value for each row
                          // console.log('isSubscriptionActive:', value, row);
                          // Render green/red circle for subscription status
                          return (
                            <span
                              style={{
                                display: "inline-block",
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                background: value ? "#22c55e" : "#ef4444",
                                border: '2px solid #fff',
                                boxShadow: '0 0 0 1px #ccc',
                              }}
                              title={value ? "Active" : "Inactive"}
                            />
                          );
                        } else {
                          if (typeof value === "string" && isValidUrl(value)) {
                            return isImageUrl(value) ? (
                              <img
                                src={value}
                                alt="image"
                                className="object-cover w-20 h-20 mx-auto"
                              />
                            ) : (
                              <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                              >
                                {value}
                              </a>
                            );
                          }
                          return value;
                        }
                      })()}
                    </td>
                  );
                })}
                {status && (
                  <td className="p-3 text-xs text-center border border-gray-300 font-montserrat_regular lg:text-base md:text-sm">
                    {status(row)}
                  </td>
                )}
                {actions && (
                  <td className="p-3 text-center font-montserrat_regular border border-gray-300 lg:text-base md:text-sm text-xs min-w-[280px]">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="flex justify-center mt-10">
          <p className="text-lg text-title font-montserrat_semi_bold">
            Pas de donnes
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomTable;
