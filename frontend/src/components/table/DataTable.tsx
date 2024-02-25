"use client"

import {
    Cell,
    ColumnDef, ColumnDefTemplate,
    flexRender,
    getCoreRowModel, HeaderContext,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


import {Filter} from "lucide-react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

const displayFilter = (header: any) => {
    return header === "Forme" || header === "Secteur";
}

const getFilterContent = (header: any) => {
    if (header === "Forme") {
        return (
            <RadioGroup defaultValue="all">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="r1"/>
                    <Label htmlFor="r1">Tous</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sa" id="r2"/>
                    <Label htmlFor="r2">SA</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="srl" id="r3"/>
                    <Label htmlFor="r3">SRL</Label>
                </div>
            </RadioGroup>
        )
    } else if (header === 'Secteur') {
        return (
            <RadioGroup defaultValue="all">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="r1"/>
                    <Label htmlFor="r1">Tous</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="primary" id="r2"/>
                    <Label htmlFor="r2">Primaire</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="secondary" id="r3"/>
                    <Label htmlFor="r3">Secondaire</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="secondary" id="r3"/>
                    <Label htmlFor="r3">Tertiaire</Label>
                </div>
            </RadioGroup>
        )
    } else return '';
}

const getTranslationSector = (cell: Cell<any, any>) => {
    const cellValue = cell.getValue();
    if (cellValue === 'PRIMARY') {
        return 'Primaire';
    } else if (cellValue === 'SECONDARY') {
        return 'Secondaire';
    } else if (cellValue === 'TERTIARY') {
        return 'Tertiaire';
    } else return flexRender(cell.column.columnDef.cell, cell.getContext());
}

export function DataTable<TData, TValue>({
                                             columns,
                                             data,
                                         }: DataTableProps<TData, TValue>) {

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        <div className="flex">
                                            {/* Filter */}
                                            {displayFilter(header.column.columnDef.header!) ?
                                                <Popover>
                                                    <PopoverTrigger>
                                                        <Filter className="h-5 w-5 mr-2" />
                                                    </PopoverTrigger>
                                                    <PopoverContent side="top">
                                                        { getFilterContent(header.column.columnDef.header) }
                                                    </PopoverContent>
                                                </Popover>
                                                : null}
                                            {/* Column header */}
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </div>
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="border-red-600">
                                        {  }
                                        { getTranslationSector(cell) }
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                Erreur lors du chargement des données.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
