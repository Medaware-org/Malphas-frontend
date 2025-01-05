import type {ErrorDto} from "@/api";

export default function retrieveErrorDto(err: any): ErrorDto {
        if (!err || !err.response)
                return {
                        summary: "Error",
                        description: "An unknown error occurred"
                }

        return {
                summary: err.response.summary || "Error",
                description: err.response.description || "An unknown error occurred"
        }
}