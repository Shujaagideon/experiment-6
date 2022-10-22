import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/all'
import Template from '.'

gsap.registerPlugin(ScrollTrigger)

export default class main{
    static mainClass

    constructor(){
        if(main.mainClass)return main.mainClass
        main.mainClass = this

        this.sections = [...document.querySelectorAll('section')]
        this.logoPieces = [...document.querySelectorAll('svg')]
        this.loader = document.querySelector('.loader')
        this.logo = document.querySelector('.logo')
        this.threeD = new Template(document.getElementById('container'), this.sections)

        
        this.loaderAnimations()
    }
    loaderAnimations(){
        gsap.to(this.logoPieces,{
            rotate: '+=360',
            duration: 3,
            repeat: -1,
            ease: 'Linear.ease'
        })
    }
    pinSections(){
        this.sections.forEach(sect=>{
            gsap.to(sect,{
                scrollTrigger:{
                    trigger: sect,
                    pin: true,
                    start: 'top 5%',
                    end: '+=2000',
                    scrub: true,
                    // markers: true,
                    onEnter:()=>{
                        gsap.set([...sect.querySelectorAll('.anim')],{opacity:1})
                        gsap.from([...sect.querySelectorAll('.anim')],{
                            opacity: 0,
                            y: 50,
                            duration: 0.2,
                            stagger: 0.05,
                            ease: 'Power.easeInOut'
                        })
                    },
                    onLeave:()=>{
                        gsap.set([...sect.querySelectorAll('.anim')],{opacity:0})
                        gsap.from([...sect.querySelectorAll('.anim')],{
                            opacity: 1,
                            y: 10,
                            duration: 0.2,
                            stagger: 0.05,
                            ease: 'Power.easeInOut'
                        })
                    },
                    onEnterBack:()=>{
                        gsap.set([...sect.querySelectorAll('.anim')],{opacity:1})
                        gsap.from([...sect.querySelectorAll('.anim')],{
                            opacity: 0,
                            y: -50,
                            duration: 0.2,
                            stagger: 0.05,
                            ease: 'Power.easeInOut'
                        })
                    },
                    onLeaveBack:()=>{
                        gsap.set([...sect.querySelectorAll('.anim')],{opacity:0})
                        gsap.from([...sect.querySelectorAll('.anim')],{
                            opacity: 1,
                            y: 50,
                            duration: 0.2,
                            stagger: 0.05,
                            ease: 'Power.easeInOut'
                        })
                    },
                },
                duration: 2,
                ease: 'Power.easeIn'
            })
        })
    }
}

new main()