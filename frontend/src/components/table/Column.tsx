"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type EnterpriseTest = {
    id: string
    name: string
    type: string
}

export const columns: ColumnDef<EnterpriseTest>[] = [
    {
        //accessorKey: "name",
        accessorKey: "nomDuSiegeDExploitation",
        header: "Nom",
    },
    {
        accessorKey: "enterprise_number",
        header: "N° d'entreprise",
    },
    {
        accessorKey: "establishment_number",
        header: "Unité d'établissement",
    },
    {
        accessorKey: "type",
        header: "Forme",
    },
]
