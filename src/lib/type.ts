export type Options = {
    label: string,
    value: string
}

export type Schema = {
    [key: string]: string
}

export type SchemaData = {
    segment_name: string,
    schema: Schema[]
}