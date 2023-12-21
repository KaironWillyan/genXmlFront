import type { FormReq } from "./FormReq";
import type { ItemXml } from "./ItemXml";

export interface XmlRequest{
    xml: string,
    items: Array<FormReq>
}