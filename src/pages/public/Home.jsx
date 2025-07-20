import React from "react";
import Carousel from "../../components/shared/Carousel";
import SearchBar from "../../components/shared/Search";
import Footer from "../../components/shared/Footer";
import FeaturedCategories from "./FeaturedCategories";

const Home = () => {
  return (
    <>
    <SearchBar/>
    <Carousel />
    <FeaturedCategories/>
    <Footer/>
    </>
  );
};

export default Home;
