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
        accessorKey: "naceMain",
        header: "NACE",
    },
    {
        accessorKey: "naceOther",
        header: "NACE (autres)",
    },
    {
        header: 'PAE',
        cell: ({ row }) => {
            const economicalActivityParkName = getNestedValue(row.original, 'economicalActivityPark.name');
            return economicalActivityParkName || null;
        },
    },
    {
        accessorKey: "actions",
        header: "Actions",
    },
]
