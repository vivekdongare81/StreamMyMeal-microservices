import { Link } from "react-router-dom";

const cuisines = [
  {
    name: "Indian",
    image: "https://snowfusionfoods.com/wp-content/uploads/2025/01/1.1.2_Mini-Panjabi_Samosa.svg"
  },
  {
    name: "Italian",
    image: "https://previews.123rf.com/images/jagcz/jagcz1304/jagcz130400151/19433764-delicious-fresh-pizza-served-on-wooden-table.jpg"
  },
  {
    name: "Chinese",
    image: "https://i.pinimg.com/564x/5f/8e/ac/5f8eacc9c1146be110d3c8045ca00a73.jpg"
  },
  {
    name: "Japanese",
    image: "https://i.pinimg.com/736x/64/8c/e0/648ce0550a2c79f7be2c5076e782f4b6.jpg"
  },
  {
    name: "American",
    image: "https://img.freepik.com/free-vector/hand-drawn-american-cuisine-illustration_23-2149333575.jpg"
  },
  {
    name: "Thai",
    image: "https://static.vecteezy.com/system/resources/thumbnails/007/884/913/small/traditional-thailand-shrimp-or-prawn-pad-thai-noodles-recipes-isolated-illustration-vector.jpg"
  }
];

const CuisinePosters = () => (
  <div className="w-full py-8">
    <h2 className="text-2xl font-bold mb-6 text-center">Browse by Cuisine</h2>
    <div className="flex justify-center gap-16 flex-wrap px-4 pb-2">
      {cuisines.map((cuisine) => (
        <Link
          key={cuisine.name}
          to={`/restaurants?cuisine=${encodeURIComponent(cuisine.name)}`}
          className="flex flex-col items-center w-48 group mb-6"
          style={{ textDecoration: 'none' }}
        >
          <img
            src={cuisine.image}
            alt={cuisine.name}
            className="w-40 h-40 object-contain mb-3 group-hover:scale-105 transition-transform duration-200"
            style={{ background: 'transparent' }}
          />
          <span className="text-xl font-semibold text-gray-800 mt-1 text-center group-hover:text-primary transition-colors duration-200">
            {cuisine.name}
          </span>
        </Link>
      ))}
    </div>
  </div>
);

export default CuisinePosters; 