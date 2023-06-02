import React, {useRef} from 'react'
import {Form, Button, Container} from 'react-bootstrap'
import {Link, useNavigate} from 'react-router-dom'
import {BiLockAlt} from 'react-icons/bi'
import {useCumailNEXTAuth} from "../contexts/CumailNEXTAuthProvider.tsx";
import {CumailNEXTAuthContextType} from "../contexts/CumailNEXTAuthContextType.tsx";
import AuthBox from "./AuthBox.tsx";

const LOGIN_SUB_URL = process.env.REACT_APP_CUMAIL_LOGIN_SUB_URL as string;

export const Signup = () => {
    const emailRef = useRef<HTMLInputElement | null>(null);
    const pwdRef = useRef<HTMLInputElement | null>(null)
    const pwdRepeatRef = useRef<HTMLInputElement | null>(null)
    const {signUpWithEmailPassword, isLoggedIn, isLoading} = useCumailNEXTAuth() as CumailNEXTAuthContextType;
    const navigate = useNavigate();

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        if (pwdRef.current?.value as string !== pwdRepeatRef.current?.value as string) return;
        // console.log(`Email: ${emailRef.current?.value as string}; Password: ${pwdRef.current?.value as string}`);
        await signUpWithEmailPassword(emailRef.current?.value as string, pwdRef.current?.value as string);
        if (isLoggedIn()) navigate('/');
    };

    return (
        <AuthBox>
            <Container className='login-container'>
                <div className=''>
                    <h2 className="login-container-header">Register new account</h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Or
                        <Link className="login-container-switch" to={`/${LOGIN_SUB_URL}`}> login to an existing
                            one</Link>
                    </p>
                </div>
                <Form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="login-form">
                        <Form.Group>
                            <Form.Label id="email" className='sr-only'>Email</Form.Label>
                            <Form.Control id="email" ref={emailRef} required placeholder='Email address'
                                          className="login-form-email"/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label id="password" className='sr-only'>Password</Form.Label>
                            <Form.Control type='password' id="password" ref={pwdRef} required placeholder='Password'
                                          className="login-form-password-mid"/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label id="password" className='sr-only'>Password</Form.Label>
                            <Form.Control type='password' id="password" ref={pwdRepeatRef} required
                                          placeholder='Repeat your password' className="login-form-password"/>
                        </Form.Group>
                    </div>
                    <Button disabled={isLoading} type="submit" className="group login-form-submit">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <BiLockAlt className='h-5 w-5 text-indigo-500 group-hover:text-indigo-400'
                                                   viewBox='0 0 20 20' fill="currentColor" aria-hidden="true"/>
                                    </span>
                        Register
                    </Button>
                </Form>
            </Container>
        </AuthBox>
    )
}
