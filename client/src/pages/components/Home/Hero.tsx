import heroImage from '../../../assets/images/hero.png';



const Hero = () => {
  return (
    <section>
      <img src={heroImage} alt="Hero" className='w-full h-full object-cover'/>
    </section>
  )
}

export default Hero