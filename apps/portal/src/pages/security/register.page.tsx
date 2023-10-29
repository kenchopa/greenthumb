import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';

import { register } from '../../services/auth.service';
import { UserRegisterRequest } from '../../types/user.type';

const Register: React.FC = () => {
  const [successful, setSuccessful] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const initialValues: UserRegisterRequest = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    repeatPassword: '',
    username: '',
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('This is not a valid email.')
      .required('This field is required!'),
    firstName: Yup.string()
      .test(
        'len',
        'The firstname must be between 1 and 128 characters.',
        (val: any) =>
          val && val.toString().length >= 1 && val.toString().length <= 128,
      )
      .required('This field is required!'),
    lastName: Yup.string()
      .test(
        'len',
        'The firstname must be between 1 and 128 characters.',
        (val: any) =>
          val && val.toString().length >= 1 && val.toString().length <= 128,
      )
      .required('This field is required!'),
    password: Yup.string()
      .test(
        'len',
        'The password must be between 8 and 64 characters.',
        (val: any) =>
          val && val.toString().length >= 8 && val.toString().length <= 64,
      )
      .required('This field is required!'),
    repeatPassword: Yup.string()
      .label('confirm password')
      .required()
      .oneOf([Yup.ref('password')], 'Passwords must match'),

    username: Yup.string()
      .test(
        'len',
        'The username must be between 3 and 64 characters.',
        (val: any) =>
          val && val.toString().length >= 3 && val.toString().length <= 64,
      )
      .required('This field is required!'),
  });

  const handleRegister = async (userRegisterRequest: UserRegisterRequest) => {
    try {
      await register(userRegisterRequest);
      setMessage('You succesfully registered an account!');
      setSuccessful(true);
    } catch (error) {
      setMessage('Failed to register on the platform.');
      setSuccessful(false);
    }
  };

  return (
    <div className="col-md-12">
      <div className="card card-container">
        <img
          src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
          alt="profile-img"
          className="profile-img-card"
        />
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleRegister}
        >
          <Form>
            {!successful && (
              <div>
                <div className="form-group">
                  <label htmlFor="username"> Username </label>
                  <Field name="username" type="text" className="form-control" />
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="alert alert-danger"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email"> Email </label>
                  <Field name="email" type="email" className="form-control" />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="alert alert-danger"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password"> Password </label>
                  <Field
                    name="password"
                    type="password"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="alert alert-danger"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="repeatPassword"> Repeat password </label>
                  <Field
                    name="repeatPassword"
                    type="password"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="repeatPassword"
                    component="div"
                    className="alert alert-danger"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="firstName"> First name </label>
                  <Field
                    name="firstName"
                    type="text"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="firstName"
                    component="div"
                    className="alert alert-danger"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName"> Last name </label>
                  <Field name="lastName" type="text" className="form-control" />
                  <ErrorMessage
                    name="lastName"
                    component="div"
                    className="alert alert-danger"
                  />
                </div>

                <div className="form-group">
                  <button type="submit" className="btn btn-primary btn-block">
                    Register
                  </button>
                </div>
              </div>
            )}

            {message && (
              <>
                <div className="form-group">
                  <div
                    className={
                      successful ? 'alert alert-success' : 'alert alert-danger'
                    }
                    role="alert"
                  >
                    {message}
                  </div>
                </div>
                <div className="w-100 text-center mt-2">
                  Start your adventure and <Link to="/login">Log In</Link>
                </div>
              </>
            )}
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default Register;
