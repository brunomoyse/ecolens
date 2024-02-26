"use client"

import { ColumnDef } from "@tanstack/react-table"
import {Enterprise} from "@/types";

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
        header: "Unité d'établissement",
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
        header: "Nace principal",
    },
    {
        accessorKey: "naceOther",
        header: "Nace (autres)",
    },
]
