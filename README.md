# Decathlon
A mobile first product page that allows you to see product information and reviews.

## Table of contents

  * [Description](#description)
  * [Usage](#usage)
  * [Features](#features)
  * [Installation](#installation)

## Description
For Decathlon, I was tasked with redesigning the photo carousel. The photos on their website are too large, and they’d like to draw inspiration from new designs. I was also given a bonus assignment to post a review on the product page.

[Live website](https://decathlon-tom.onrender.com/)

<img width="344" height="1225" alt="localhost_8000_ (3)" src="https://github.com/user-attachments/assets/93175858-c17d-4d33-aed0-ad86c17ab2ec" />

## Usage
One way to interact is to post a review. There's a large button labeled “Add your review”; and when you click it, a form will appear. You can fill out the form and click “Submit” when you're done.

<img width="370" height="520" alt="reviewpostdecathlon-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/c4f446cd-8ae0-461c-8914-665688455ef6" />

## Features
For the review form, I chose to use their accent color throughout, because it was the best fit. I also gave each element the same spacing so that it’s the same size everywhere, giving the design a very clean look. I also worked with different layers; the website is still mostly functional even when CSS and JavaScript are disabled. 

### Carrousel
<table>
  <tr>
    <td>
     <h2>Functional + Reliable</h2>
     <img width="228" src="https://github.com/user-attachments/assets/19c6376f-c0b7-40ab-abb3-28f521102f2c" />
    </td>
    <td>
     <h2>Usable</h2>
     <img width="228" src="https://github.com/user-attachments/assets/89bc8065-1331-423a-b2e2-7a87345c4cc5" />
    </td>
    <td>
     <h2>Pleasurable</h2>
     <img width="228" src="https://github.com/user-attachments/assets/cad5e015-b85c-4e3c-91ed-4b9b3032b27a" />
    </td>
  </tr>
</table>

### Review form
<table>
  <tr>
    <td>
     <h2>Functional + Reliable</h2>
     <img width="228" src="https://github.com/user-attachments/assets/5e0b7cd8-030b-4385-a967-b8de8008d199" />
    </td>
    <td>
     <h2>Usable</h2>
     <p>Form is not hidden by default</p>
     <img width="228" src="https://github.com/user-attachments/assets/ff2bf580-9a88-482c-8411-bf869cc10c7c" />
    </td>
    <td>
     <h2>Pleasurable</h2>
     <p>Form is hidden by default and can be opened by clicking on the button</p>
     <img width="228" src="https://github.com/user-attachments/assets/6a0669b6-459c-4c61-b326-878c03fe1239" />
    </td>
  </tr>
</table>

The photo selector works via JavaScript, but you can also scroll through the photo previews themselves. So if JavaScript isn’t working, the photo selector is hidden, since it wouldn’t work anyway. Instead, you can still scroll through the photos in the preview thanks to the `overflow` property in the CSS. And if the CSS isn’t working, the photos will simply appear neatly one below the other, and they won’t be too large thanks to the fixed width and height specified in the HTML.

There is also a click event on the “Add your review” button that causes the form to appear. By default, JavaScript adds a “hidden” class to the form, so if JavaScript isn't working, the form will still be visible. Otherwise, the click event on the button won't work and the form will never expand, meaning nothing will be visible.

## Installation
- Clone the repository
- Open the folder in VS Code
- Open the terminal and type in these commands:

`npm install`
<br>
`npm start`
- Go to `localhost:8000` to see it live
