"use client"

import { ColumnDef } from "@tanstack/react-table"
import {Enterprise} from "@/types";

export const columns: ColumnDef<Enterprise>[] = [
    {
        //accessorKey: "name",
        accessorKey: "name",
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
