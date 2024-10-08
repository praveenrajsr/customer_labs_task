'use client'
import React, { FormEvent, useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Label } from "@/components/ui/label"
import { Input } from '@/components/ui/input'
import { Options, SchemaData } from '@/lib/type'
import { ChevronDown } from 'lucide-react'

const data_options: Options[] = [
    { label: 'First Name', value: "first_name" },
    { label: 'Last Name', value: "last_name" },
    { label: 'Gender', value: "gender" },
    { label: 'Age', value: "age" },
    { label: 'Account Name', value: "account_name" },
    { label: 'City', value: "city" },
    { label: 'State', value: "state" },
]

const SaveSegment = ({ }) => {
    const [key, setKey] = React.useState(+new Date())
    const [optionsState, setOptionsState] = useState<{ options: Options[], selectedOptions: Options[] }>({
        options: data_options,
        selectedOptions: []
    });
    const [openSection, setOpenSection] = useState<number | null>(null);
    const [value, setValue] = useState<string | undefined>(undefined) //Holds the selected value to reset the add schema select
    const [segmentName, setSegmentName] = useState('')

    const sectionRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
                setOpenSection(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sectionRef]);


    const addOptionState = (selectedData: Options) => {
        setOptionsState(prevState => ({
            options: prevState.options.filter(option => option.value !== selectedData.value),
            selectedOptions: [...prevState.selectedOptions, ...(selectedData ? [selectedData] : [])]
        }));
    }

    const replaceOptionState = (oldSelected: Options, newSelectedData: Options, index: number) => {
        setOptionsState(prevState => {
            let updatedOptions = prevState.options;
            if (!prevState.options.some(option => option.value === oldSelected.value)) {
                updatedOptions = [oldSelected, ...prevState.options];
            }
            setOpenSection(null)
            return {
                options: updatedOptions.filter(option => option.value !== newSelectedData.value),
                selectedOptions: [
                    ...prevState.selectedOptions.slice(0, index),
                    newSelectedData,
                    ...prevState.selectedOptions.slice(index + 1).filter(option => option.value !== oldSelected.value)
                ]
            };
        });
    }

    const addToSchema = (e: FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement);
        const selectedOption = formData.get('addschema') as string;
        if (!selectedOption) return;
        const selectedData = optionsState.options.find(option => option.value === selectedOption)
        addOptionState(selectedData as Options)
        setValue(undefined)
        setKey(+new Date())
    }

    const saveSegmentEntry = async () => {
        const schema = optionsState.selectedOptions.map(option => ({
            [option.value]: option.label
        }));
        // Basic validation
        if (segmentName === '' || schema.length === 0) {
            if (segmentName === '') {
                alert("Please enter the name of the segment");
            } else {
                alert("Please add at least one entry in schema");
            }
            return;
        }

        const data: SchemaData = {
            "segment_name": segmentName,
            "schema": [
                ...schema
            ]
        }
        try {
            const response = await fetch('https://webhook.site/394fcc63-b093-47c0-a3d4-5e0ea8de0b19', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': '80fc0e6b-870a-45bf-8e0d-a31e07cdd17e'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            console.log('Response:', responseData);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            alert('Schema saved successfully'); //mock the successful save functionality

            // Reset the selected schema
            setOptionsState({
                options: data_options,
                selectedOptions: []
            });
        }
    }

    return (

        <Sheet>
            <SheetTrigger asChild>
                <Button className='rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>Save segment</Button>
            </SheetTrigger>
            <SheetContent side={'right'} className='bg-white'>
                <SheetHeader>
                    <SheetTitle>Saving Segment</SheetTitle>
                    <SheetDescription></SheetDescription>
                </SheetHeader>
                <div className="flex flex-col my-5 h-[95%]">
                    <section className='grow'>
                        <Label htmlFor="name" className="text-left mb-4">
                            Enter the Name of the Segment
                        </Label>
                        <Input onChange={e => setSegmentName(e.target.value)} id="name" placeholder="Name of the segment" className="col-span-3" />
                        <div className='mt-5'>
                            <p>To save your segment, you need to add the schemas to build the query</p>
                            <form onSubmit={(e: FormEvent) => addToSchema(e)}>
                                {
                                    optionsState.selectedOptions.length > 0 &&
                                    (
                                        <section ref={sectionRef} className='border-2 border-blue-500 px-2 py-4 mt-2'>
                                            {optionsState.selectedOptions.map((selectedOption, index) => (
                                                <div key={index}>
                                                    <Button
                                                        variant={'outline'}
                                                        className={`flex justify-between w-full my-2`}
                                                        onClick={() => setOpenSection(openSection === index ? null : index)}
                                                    >
                                                        <p>{selectedOption.label}</p>
                                                        <ChevronDown className='text-neutral-400' />
                                                    </Button>
                                                    <section
                                                        className={` ${openSection === index ? 'h-auto border border-t-0' : 'h-0'} overflow-hidden transition-[height] duration-75 rounded-sm`}
                                                    >
                                                        <ul>
                                                            {optionsState.options.map((option, key) => (
                                                                <li
                                                                    className='py-1 px-3 hover:bg-slate-100 cursor-pointer'
                                                                    key={key}
                                                                    onClick={() => replaceOptionState(selectedOption, option, index)}
                                                                >
                                                                    {option.label}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </section>
                                                </div>
                                            ))}


                                        </section>

                                    )
                                }
                                <div className='mt-8'>
                                    <Select key={key} name='addschema' value={value}>
                                        <SelectTrigger className="w-full" >
                                            <SelectValue placeholder="Add schema to segment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {optionsState.options.map((option, key) => (
                                                <SelectItem key={key} value={option.value}>{option.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                </div>
                                <Button type='submit' variant={'ghost'} className='p-0 hover:bg-transparent underline'>+Add new schema</Button>
                            </form>
                        </div>
                    </section>
                    <section>
                        <SheetClose asChild>
                            <div className='flex flex-row gap-2'>
                                <Button onClick={saveSegmentEntry}>Save the Segment</Button>
                                <Button variant={'secondary'}>Cancel</Button>
                            </div>
                        </SheetClose>
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default SaveSegment