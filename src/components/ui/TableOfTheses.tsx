import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { Thesis } from "@/interface/Thesis ";

interface TableOfThesesProps {
  theses: Thesis[];
}

const TableOfTheses: React.FC<TableOfThesesProps> = ({ theses }) => {
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto max-w-4xl bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Supervised Theses</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Supervisor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {theses.map((thesis) => (
              <TableRow key={thesis.id}>
                <TableCell>{thesis.title}</TableCell>
                <TableCell>
                  {thesis.supervisor ? (
                    <span className="text-green-600 font-medium">{thesis.supervisor}</span>
                  ) : (
                    <span className="text-red-500 italic">Not Supervised</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableOfTheses;
