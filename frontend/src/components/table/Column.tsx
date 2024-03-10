"use client"

import { ColumnDef } from "@tanstack/react-table"
import {Enterprise} from "@/types";

// Add this utility function to safely access nested properties
function getNestedValue<T>(item: T, path: string): any {
    // @ts-ignore
    return path.split('.').reduce((obj, key) => (obj && obj[key] != null) ? obj[key] : null, item);
}

export const columns: ColumnDef<Enterprise>[] = [
    {
        accessorKey: "name",
        header: "Nom",
    },
    {
        accessorKey: "enterpriseNumber",
        header: "N° d'entreprise",
    },
    {
        accessorKey: "establishmentNumber",
        header: "Unité d'étab.",
    },
    {
        accessorKey: "form",
        header: "Type d'entité",
    },
    {
        accessorKey: "sector",
        header: "Secteur",
    },
    {
        accessorKey: "naceLetter",
        header: "NACE",
    },
    {
        header: 'PRE',
        cell: ({ row }) => {
            const economicalActivityParkName = getNestedValue(row.original, 'economicalActivityPark.codeCarto');
            return economicalActivityParkName || null;
        },
    },
    {
        accessorKey: "actions",
        header: "Actions",
    },
]
