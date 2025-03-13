import { signInWithGoogle } from "../firebase-config";

export const Auth = () => {

    return (
        <div>
            <h1 className="welcome-header">
                Welcome to the Google Docs Clone
            </h1>
            <div className="signIn">
                <button 
                    onClick={signInWithGoogle}
                    className="signin-btn"
                >
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};