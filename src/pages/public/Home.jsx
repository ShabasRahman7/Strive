import React from "react";
import Carousel from "../../components/shared/Carousel";
import SearchBar from "../../components/shared/SearchBar";
import Footer from "../../components/shared/Footer";
import FeaturedCategories from "./FeaturedCategories";
import TopSellingProducts from "./TopSellingProducts";

const Home = () => {
  return (
    <>
    <SearchBar/>
    <Carousel />
    <FeaturedCategories/>
      <TopSellingProducts/>
    <Footer/>
    </>
  );
};

export default Home;
