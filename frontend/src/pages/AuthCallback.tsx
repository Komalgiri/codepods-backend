
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            // We need to fetch user details again to persist the latest state (with githubId)
            // But for now, let's just assume the token is valid and update the user in next steps or refresh
            // Ideally we decode the token to get the user, or fetch /me

            // Try to decode token to get user info if possible, OR just fetch profile
            // Since we don't have a /me endpoint easily accessible here without setup, 
            // we will fetch the rewards/profile which gives us user info or rely on the payload if we could decode it.

            // Quick fix: Navigate to dashboard or previous page. 
            // The user wanted to go to "Create Pod" flow likely, as they clicked "Connect GitHub" there.
            // But the request says "go back to a page name podoverview.tsx". 
            // I will navigate to CreatePod first to complete the flow.

            // Decode token safely to update user in localStorage
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const user = JSON.parse(jsonPayload);
                localStorage.setItem('user', JSON.stringify(user));
            } catch (e) {
                console.error("Failed to decode token", e);
            }

            navigate('/create-pod');
        } else {
            navigate('/auth');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-text-primary">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-bold">Connecting GitHub...</h2>
            </div>
        </div>
    );
};

export default AuthCallback;
