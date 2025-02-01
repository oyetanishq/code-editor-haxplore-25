import CodeEditor, { exampleTabs, tab } from "@components/code-editor";
import { useState, useEffect } from "react";



const Right = () => {
    const [tabs, setTabs] = useState<tab[]>(exampleTabs);

    return (
        <div className="bg-orange-400 w-[77%] h-full">
        <CodeEditor tabs={tabs} setTabs={setTabs} className="w-full h-[calc(100%-8rem)]" />
        </div>
    )
}

export default Right
