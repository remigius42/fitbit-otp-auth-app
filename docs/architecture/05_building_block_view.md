# Building Block View

## White-box Overall System

**_\<Overview Diagram>_**

```mermaid
C4Container
  title Container diagram for fitbit-otp-auth-app

  Person(user, User, "A user of the OTP Auth app")

  Container_Boundary(c1, "fitbit-otp-auth-app") {
    Container(app, "Smartwatch app", "ECMAScript 5.1")
    Container(companion, "Companion app", "TypeScript", "Runs in Fitbit app on smartphone as the application's settings")
  }

  Rel(user, app, "Reads Time-based One-time Passwords (TOTP)")
  Rel(user, companion, "Configures TOTPs and application")
  Rel(companion, app, "sends configuration to")
```

Motivation  
_\<text explanation>_

Contained Building Blocks  
_\<Description of contained building block (black boxes)>_

Important Interfaces  
_\<Description of important interfaces>_

### \<Name black box 1>

_\<Purpose/Responsibility>_  
_\<Interface(s)>_  
_\<(Optional) Quality/Performance Characteristics>_  
_\<(Optional) Directory/File Location>_  
_\<(Optional) Fulfilled Requirements>_  
_\<(optional) Open Issues/Problems/Risks>_

### \<Name black box 2>

\<black box template>

### \<Name black box n>

\<black box template>

### \<Name interface 1>

…

### \<Name interface m>

## Level 2

### White Box _\<building block 1>_

```mermaid
C4Component
  title Component diagram for fitbit-otp-auth-app - Smartwatch app

  Person(user, User, "A user of the OTP Auth app")

  Container_Boundary(app, "Smartwatch app") {
    Component(ui, "User interface", "")
    Component(tokenManager, "TokenManager", "a", "b")
    Component(settingsManager, "SettingsManager", "", "")
  }

  Container(companion, "Companion app", "TypeScript", "Runs in Fitbit app on smartphone as the application's settings")


  Rel(user, ui, "Reads Time-based One-time Passwords (TOTP)")
  Rel(user, companion, "Configures TOTPs and application")
  Rel(companion, tokenManager, "sends configuration to")
```

\<white box template>

### White Box _\<building block 2>_

\<white box template>

…

### White Box _\<building block m>_

\<white box template>

## Level 3

### White Box \<\_building block x.1\_\>

\<white box template>

### White Box \<\_building block x.2\_\>

\<white box template>

### White Box \<\_building block y.1\_\>

\<white box template>
