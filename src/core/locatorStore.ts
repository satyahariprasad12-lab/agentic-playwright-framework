export type LocatorConfig = {
    primary: string;
    fallbacks?: string[];
};
export const locatorStore: Record<string, LocatorConfig> = {
    usernameInput: {
        primary: "[data-test=\"username\"]",
        fallbacks: [
            'input[name="user-nameeee"]',
            'role=textbox[name="Usernameee"]'
        ]
    },
    passwordInput: {
        primary: "[data-test=\"password\"]",
        fallbacks: [
            'input[name="passwordd"]',
            'role=textbox[name="Passwordd"]'
        ]
    },
    loginButton: {
        primary: '#login-button',
        fallbacks: [
            'input[type="submit"]',
            'text=Login'
        ],
    },
};
