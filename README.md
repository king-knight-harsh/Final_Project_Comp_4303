# Spare Spoon App

Spare Spoon transforms the way home cooks approach their meals by offering recipe recommendations based on the ingredients they already have at hand. By focusing on utilizing available ingredients, Spare Spoon aims to reduce food waste, save users money, and introduce them to a variety of dishes they might never have tried before.

## Team Members

1. [Harsh Sharma](https://github.com/king-knight-harsh)
2. [Sahil Mahey](https://github.com/SahilMahey)

## Table of Contents

- [Key Features](#key-features)
- [Additional Features](#additional-features)
- [Technical Stack](#technical-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Video Demo](#video-demo)
- [Contributing](#contributing)
- [License](#license)

## Key Features

- **Authentication and Data Security:**
  - Each user has authentication to secure and protect their data.
  - User can login/signUp using either email and password or Google Oauth.
  - User can request to change their password if they forgot their password
  - User can delete their account if they wish too.

- **Integration of OPEN AI:**
  - Users can regenerate suggestions if they do not like the initial recommendation.
  - Recipes are created while keeping users dietary preference, intolerance and allergies in mind.

- **Favorite Recipes:**
  - Users can mark specific recipes as favorites.
  - Filter functionality to view recipes by favorites.

- **User Profile Management:**
  - Users can edit and view their personal information in the profile section.

- **Recipe Customization:**
  - Users can edit existing recipes.
  - Option to add images to recipes for customization and personalization.

## Additional Features

1. Users can download recipes as PDFs.
2. User can download shopping list for a recipe.
3. Link to available videos online for a particular recipe.
4. Filtering using the text for recipes.
5. Adding new custom recipes.
6. Auto-generating a shopping list for a recipe.

## Technical Stack

- **UI Development:** Flutter | Figma
- **User Management:** FirebaseAuth
- **Database:** Firestore (To store details of items and user profiles)
- **Image Storage:** Firebase Cloud Storage (For storing item images)
- **Messaging:** Firebase Messaging (For user-to-user communication)

## Project Structure

```plaintext
Components/
Controller/
Model/
Utils/
View/
  Authentication/
  Introduction/
  Profile/
  Recipes/
  home_page.dart
main.dart
```

## Video Demo

1. [Full Video Demonstration](https://youtu.be/lKLkdpRI8Xg)
2. [Short Add Style Video](https://youtu.be/11lew5w7Lvs)

## Contributing

We welcome contributions to enhance Spare Spoon! Please follow these guidelines:

1. Fork the repository.
2. Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m 'Add your feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute the code. We appreciate your contributions and hope Spare Spoon brings joy to your culinary adventures! 🍲🚀
