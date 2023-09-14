import DataUri from "datauri/parser"

const dUri = new DataUri()

const dataUri = ( fileExt, buffer ) => {
    return dUri.format(fileExt, buffer)
}

export default dataUri