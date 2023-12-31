import styles from './RegisterForm.module.scss';
import ava from '../../../assets/imgs/Rectangle 46.png'
import { useState, useEffect } from 'react';
import { useActions } from '../../../hooks/useActions';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { get, getDatabase, ref, set } from "firebase/database";
import Input from '../../UI/Input/Input';

type Active = {
    setActive: React.Dispatch<React.SetStateAction<boolean>>
}

const RegisterForm = ({ setActive }: Active) => {
    const [registerForm, setRegisterForm] = useState({
        username: '',
        email: '',
        password: '',
        checkpass: ''
    });

    const [validationErrors, setValidationErrors] = useState<{
        username?: string;
        email?: string;
        password?: string;
        checkpass?: string;
    }>({});

    const [isPasswordCorrect, setIsPasswordCorrect] = useState(true);

    const { setUser } = useActions();

    const UserRegister = async (email: string, password: string) => {
        try {
            const auth = getAuth();
            const { user } = await createUserWithEmailAndPassword(auth, email, password);

            // Добавление пользователя в базу данных
            const database = getDatabase();
            const userRef = ref(database, 'users/' + user.uid);
            const allUsersRef = ref(database, 'users');
            let numChildren = 0;

            await get(allUsersRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    numChildren = data ? Object.keys(data).length : 0;
                    console.log("Количество узлов в узле 'users': " + numChildren);
                } else {
                    console.log("Узел 'users' не существует.");
                }
            }).catch((error) => {
                console.error("Ошибка при получении данных: " + error);
            })

            const userData = {
                username: registerForm.username,
                email: email,
                userId: numChildren + 1
            };
            await set(userRef, userData);

            // Установка состояния пользователя
            setUser({
                email: user.email,
                id: user.uid,
                token: (user as any).accessToken,
            });
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                alert('This email is already used. Please choose other one or use the password recovery feature.');
            } else {
                console.error("Registration Error:", error);
            }
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegisterForm({
            ...registerForm,
            [name]: value
        });
    }

    const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Проводим проверки и обновляем состояние ошибок валидации
        const errors: { [key: string]: string } = {};
        // Проверка имени пользователя
        if (registerForm.username.length < 4) {
            errors.username = 'Username should be at least 4 characters long.';
        }
        // Проверка пароля
        if (registerForm.password.length < 8) {
            errors.password = 'Password should be at least 8 characters long.';
        } else if (!/[A-Z]/.test(registerForm.password)) {
            errors.password = 'Password should contain at least one uppercase letter.';
        } else if (!/\d/.test(registerForm.password)) {
            errors.password = 'Password should contain at least one digit.';
        }

        // Проверка подтверждения пароля
        if (registerForm.password !== registerForm.checkpass) {
            errors.checkpass = 'Passwords do not match.';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
        } else {
            // Если ошибок нет, отправляем форму
            UserRegister(registerForm.email, registerForm.password);
            setRegisterForm({
                username: '',
                email: '',
                password: '',
                checkpass: '',
            });
            setValidationErrors({});
            setActive(false)
        }
    }

    useEffect(() => {
        setIsPasswordCorrect(registerForm.password === registerForm.checkpass);
    }, [registerForm.password, registerForm.checkpass]);

    return (
        <div className={styles.register__form}>
            <h2>Registration</h2> 
            <div className={styles.full__form}>
                <div className={styles.avatar}>
                    <img src={ava} alt="avatar" />
                </div>
                <form onSubmit={handleSubmitForm} className={styles.form}>
                    <div className={styles.inputs__pos}>
                        <div className={styles.valid__box}>
                            <Input
                                idNameHtmlFor='username'
                                type='text'
                                labelText='Username'
                                value={registerForm.username}
                                handleChange={handleChange}
                            />
                            {validationErrors.username && (
                                <p className={styles.warning}>{validationErrors.username}</p>
                            )}
                        </div>
                        <Input
                            idNameHtmlFor='email'
                            type='email'
                            placeholder='yourEmail@gmail.com' 
                            labelText='E-mail'
                            value={registerForm.email}
                            handleChange={handleChange}
                        />
                    </div>
                    <div className={styles.inputs__pos}>
                        <div className={styles.valid__box}>
                            <Input
                                idNameHtmlFor='password'
                                type='password'
                                placeholder='********'
                                labelText='Password'
                                value={registerForm.password}
                                handleChange={handleChange}
                            />
                            {validationErrors.password && (
                                <p className={styles.warning}>{validationErrors.password}</p>
                            )}
                        </div>
                        <div className={styles.valid__box}>
                            <Input
                                idNameHtmlFor='checkpass'
                                type='password'
                                placeholder='********'
                                labelText='Confirm password'
                                value={registerForm.checkpass}
                                handleChange={handleChange}
                            />
                            {
                                isPasswordCorrect || validationErrors.checkpass ? <></> 
                                :   
                                <p className={styles.warning}>Password mismatch</p>
                            }
                        </div>
                    </div>
                    <button className={styles.btn} type='submit'>Submit</button>
                </form>
            </div>
        </div>  
    )
}

export default RegisterForm;