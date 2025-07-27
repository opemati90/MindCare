import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:reactive_forms/reactive_forms.dart';

class RegisterPage extends StatelessWidget {
  const RegisterPage({super.key});

  @override
  Widget build(BuildContext context) {
    final form = FormGroup({
      'firstName': FormControl<String>(validators: [Validators.required]),
      'lastName': FormControl<String>(validators: [Validators.required]),
      'email': FormControl<String>(
        validators: [Validators.required, Validators.email],
      ),
      'password': FormControl<String>(
        validators: [Validators.required, Validators.minLength(8)],
      ),
      'confirmPassword': FormControl<String>(
        validators: [Validators.required],
      ),
      'termsAccepted': FormControl<bool>(
        value: false,
        validators: [Validators.requiredTrue],
      ),
    });

    // Add password confirmation validator
    form.addValidators([
      Validators.mustMatch('password', 'confirmPassword'),
    ]);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/login'),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: ReactiveForm(
            formGroup: form,
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Title
                  Center(
                    child: Column(
                      children: [
                        Icon(
                          Icons.favorite,
                          size: 60,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Create Account',
                          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Join Mindcare for better healthcare',
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  
                  // First Name
                  ReactiveTextField<String>(
                    formControlName: 'firstName',
                    decoration: InputDecoration(
                      labelText: 'First Name',
                      hintText: 'Enter your first name',
                      prefixIcon: const Icon(Icons.person_outlined),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    validationMessages: {
                      ValidationMessage.required: (_) => 'First name is required',
                    },
                  ),
                  const SizedBox(height: 16),
                  
                  // Last Name
                  ReactiveTextField<String>(
                    formControlName: 'lastName',
                    decoration: InputDecoration(
                      labelText: 'Last Name',
                      hintText: 'Enter your last name',
                      prefixIcon: const Icon(Icons.person_outlined),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    validationMessages: {
                      ValidationMessage.required: (_) => 'Last name is required',
                    },
                  ),
                  const SizedBox(height: 16),
                  
                  // Email
                  ReactiveTextField<String>(
                    formControlName: 'email',
                    decoration: InputDecoration(
                      labelText: 'Email',
                      hintText: 'Enter your email',
                      prefixIcon: const Icon(Icons.email_outlined),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    keyboardType: TextInputType.emailAddress,
                    validationMessages: {
                      ValidationMessage.required: (_) => 'Email is required',
                      ValidationMessage.email: (_) => 'Enter a valid email',
                    },
                  ),
                  const SizedBox(height: 16),
                  
                  // Password
                  ReactiveTextField<String>(
                    formControlName: 'password',
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      hintText: 'Enter your password',
                      prefixIcon: const Icon(Icons.lock_outlined),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    validationMessages: {
                      ValidationMessage.required: (_) => 'Password is required',
                      ValidationMessage.minLength: (_) => 'Password must be at least 8 characters',
                    },
                  ),
                  const SizedBox(height: 16),
                  
                  // Confirm Password
                  ReactiveTextField<String>(
                    formControlName: 'confirmPassword',
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: 'Confirm Password',
                      hintText: 'Confirm your password',
                      prefixIcon: const Icon(Icons.lock_outlined),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    validationMessages: {
                      ValidationMessage.required: (_) => 'Please confirm your password',
                      ValidationMessage.mustMatch: (_) => 'Passwords do not match',
                    },
                  ),
                  const SizedBox(height: 16),
                  
                  // Terms and Conditions
                  ReactiveCheckboxListTile(
                    formControlName: 'termsAccepted',
                    title: RichText(
                      text: TextSpan(
                        style: TextStyle(color: Colors.grey[700]),
                        children: [
                          const TextSpan(text: 'I agree to the '),
                          TextSpan(
                            text: 'Terms of Service',
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.primary,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                          const TextSpan(text: ' and '),
                          TextSpan(
                            text: 'Privacy Policy',
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.primary,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ],
                      ),
                    ),
                    controlAffinity: ListTileControlAffinity.leading,
                    contentPadding: EdgeInsets.zero,
                  ),
                  const SizedBox(height: 24),
                  
                  // Register Button
                  ReactiveFormConsumer(
                    builder: (context, form, child) {
                      return ElevatedButton(
                        onPressed: form.valid ? () => _handleRegister(context, form) : null,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          'Create Account',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 24),
                  
                  // Sign In Link
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Already have an account? ',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                      TextButton(
                        onPressed: () => context.go('/login'),
                        child: const Text('Sign In'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _handleRegister(BuildContext context, FormGroup form) {
    if (form.valid) {
      final firstName = form.control('firstName').value as String;
      final lastName = form.control('lastName').value as String;
      final email = form.control('email').value as String;
      final password = form.control('password').value as String;
      
      // TODO: Implement Firebase authentication
      print('Register: $firstName $lastName, $email, $password');
      
      // For now, navigate to dashboard
      context.go('/dashboard');
    }
  }
}
