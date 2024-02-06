import {useState, useEffect} from 'react';
import {DataTable} from "@/components/table/DataTable";

import { columns } from "@/components/table/Column";
import {EnterpriseTest} from "@/components/table/Column";

interface LeftPanelProps {
    isVisible: boolean
}

import apolloClient from "@/lib/apollo-client";
import gql from "graphql-tag";

// Fetch data from the API
const fetchData = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}`);

    return response.json();
}

export default function BottomPanel({ isVisible }: LeftPanelProps) {

    const [enterprises, setEnterprises] = useState<EnterpriseTest[]>([])

    apolloClient.query({
        query: gql`
            query {
                enterprises (
                    first: 5
                ) {
                    nomDuSiegeDExploitation
                }
            }
        `
    }).then((res) => {
        setEnterprises(res.data.enterprises)
    })

    return (
        <aside
            className={`fixed z-20 h-auto max-h-[400px] w-full bg-gray-200 p-4 shadow-lg bottom-panel bottom-0 ${isVisible ? 'visible' : ''}`}>
            <div className="container mx-auto py-10">
                {enterprises && <DataTable columns={columns} data={enterprises}/>}
            </div>
        </aside>
    );
}
