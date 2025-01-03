import {defineStore} from "pinia";
import {eraseToken, retrieveToken, storeToken} from "@/services/tokenService.ts";

export const useSessionStore = defineStore("session", {
        state: () => ({token: retrieveToken()}),

        actions: {
                setToken(newToken: string) {
                        this.token = newToken
                        storeToken(newToken)
                },

                getToken(): string | undefined {
                        return this.token
                },

                forgetToken() {
                        eraseToken();
                        this.token = undefined
                }
        }
})