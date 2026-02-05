import http from "@/utils/api/api.ts";
import {LoginParams, LoginResult} from "@/pages/authentication/login/data";

export async function login(data: LoginParams): Promise<LoginResult> {
    const response = await http.post<LoginResult>('/pub/authenticate', data);
    // if (response.status !== 200) {
    //     throw new Error('Network response was not ok');
    // }
    return response.data;
}