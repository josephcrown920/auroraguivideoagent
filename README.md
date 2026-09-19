# Aurora Canvas

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Aurora Creative Studio</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', Roboto, sans-serif;
    background: #000;
    color: #fff;
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  }

  .bg-layer {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  }

  .bg-layer::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(ellipse at 30% 85%, rgba(255, 180, 80, 0.25) 0%, transparent 55%),
      radial-gradient(ellipse at 70% 90%, rgba(120, 80, 200, 0.2) 0%, transparent 50%),
      linear-gradient(180deg, #000 0%, #0a0a12 40%, #0f0a1a 100%);
  }

  .bg-cards {
    position: absolute;
    inset: 0;
    opacity: 0.35;
    pointer-events: none;
  }

  .bg-card {
    position: absolute;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    transform: rotate(var(--rot, 0deg));
  }

  .bg-card-inner {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--c1, #333), var(--c2, #111));
    position: relative;
  }

  .bg-card:nth-child(1) { top: 8%; left: 5%; width: 180px; height: 240px; --rot: -6deg; --c1: #2a4a6a; --c2: #1a2a3a; }
  .bg-card:nth-child(2) { top: 15%; right: 8%; width: 200px; height: 280px; --rot: 5deg; --c1: #6a4a2a; --c2: #3a2a1a; }
  .bg-card:nth-child(3) { bottom: 18%; left: 10%; width: 220px; height: 160px; --rot: 3deg; --c1: #4a2a5a; --c2: #2a1a3a; }
  .bg-card:nth-child(4) { bottom: 10%; right: 12%; width: 190px; height: 250px; --rot: -4deg; --c1: #2a5a4a; --c2: #1a3a2a; }
  .bg-card:nth-child(5) { top: 45%; left: 45%; width: 160px; height: 200px; --rot: 8deg; --c1: #5a3a3a; --c2: #3a2020; }

  .bg-card-inner::after {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 30% 40%, rgba(255, 200, 100, 0.3) 0%, transparent 30%),
      radial-gradient(circle at 70% 60%, rgba(100, 150, 255, 0.2) 0%, transparent 25%);
  }

  .wrap {
    position: relative;
    z-index: 2;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .hero {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
  }

  .top-badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: 7px 18px;
    border-radius: 999px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 28px;
  }

  .top-badge .new-pill {
    background: linear-gradient(135deg, #b8860b, #d4a84b);
    color: #1a1200;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  h1 {
    font-size: clamp(36px, 7vw, 68px);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -2px;
    margin-bottom: 18px;
    color: #fff;
  }

  .subhead {
    font-size: clamp(14px, 2vw, 18px);
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
    max-width: 650px;
    margin-bottom: 36px;
  }

  .mode-switch {
    display: flex;
    gap: 4px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    padding: 6px;
    margin-bottom: 20px;
  }

  .mode-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 32px;
    border-radius: 999px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s;
  }

  .mode-btn.active {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    font-weight: 600;
  }

  .mode-btn svg { width: 20px; height: 20px; }

  .prompt-card {
    width: 100%;
    max-width: 720px;
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 28px;
    padding: 18px;
    box-shadow: 
      0 30px 80px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .prompt-top {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .add-btn {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.4);
    transition: all 0.2s;
    flex-shrink: 0;
    font-size: 22px;
  }

  .add-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.7);
  }

  .prompt-input {
    flex: 1;
    background: none;
    border: none;
    color: #fff;
    font-size: 16px;
    resize: none;
    outline: none;
    padding: 14px 0;
    min-height: 52px;
    max-height: 200px;
    font-family: inherit;
    line-height: 1.4;
  }

  .prompt-input::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 0 0;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin-top: 12px;
    flex-wrap: wrap;
  }

  .model-pill {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    padding: 7px 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .model-pill:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .model-logo {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #fff, #888);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
    color: #000;
  }

  .model-pill .name {
    font-size: 13px;
    font-weight: 500;
    color: #fff;
  }

  .model-pill .chev {
    color: rgba(255, 255, 255, 0.4);
    font-size: 10px;
  }

  .seg-control {
    display: flex;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 3px;
    gap: 2px;
  }

  .seg-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    padding: 6px 12px;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .seg-btn.active {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .square-icon {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.5);
    border-radius: 3px;
    display: inline-block;
    vertical-align: middle;
  }

  .gen-btn {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    padding: 10px 22px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s;
  }

  .gen-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.22);
    transform: translateY(-1px);
  }

  .gen-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .gen-btn svg {
    width: 16px;
    height: 16px;
  }

  .stats-row {
    display: flex;
    gap: 50px;
    margin-top: 50px;
  }

  .stat-item {
    text-align: center;
  }

  .stat-num {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
  }

  .stat-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    margin-top: 2px;
    letter-spacing: 0.3px;
  }

  .settings-fab {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 100;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .settings-fab:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }

  .logo-top {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    font-size: 16px;
    color: #fff;
  }

  .logo-mark {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, #d4a84b, #b8860b);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1a1200;
    font-weight: 900;
  }

  .gallery {
    position: relative;
    z-index: 2;
    padding: 60px 24px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .gallery h2 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 24px;
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
  }

  .g-card {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s;
  }

  .g-card:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 200, 100, 0.3);
    box-shadow: 0 16px 50px rgba(0, 0, 0, 0.4);
  }

  .g-thumb {
    width: 100%;
    aspect-ratio: 4/3;
    background: linear-gradient(135deg, #222, #111);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .g-thumb img, .g-thumb video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .g-info {
    padding: 14px;
  }

  .g-model {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .g-prompt {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .chat-fab {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 50;
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #fff;
    cursor: pointer;
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }

  .chat-fab:hover {
    background: rgba(255, 255, 255, 0.18);
    transform: scale(1.05);
  }

  .chat-panel {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 51;
    width: 380px;
    max-height: 520px;
    background: rgba(20, 20, 30, 0.85);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 18px;
    display: none;
    flex-direction: column;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
  }

  .chat-panel.open { display: flex; }

  .chat-hd {
    padding: 14px 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .chat-hd h3 { font-size: 14px; font-weight: 600; }

  .chat-close {
    background: none; border: none; color: rgba(255,255,255,0.4);
    cursor: pointer; font-size: 20px;
  }

  .chat-body {
    flex: 1; overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 10px;
  }

  .cm {
    max-width: 85%; padding: 9px 13px; border-radius: 12px;
    font-size: 13px; line-height: 1.45; word-wrap: break-word;
    white-space: pre-wrap;
  }

  .cm.u { align-self: flex-end; background: rgba(255,255,255,0.15); color: #fff; border-bottom-right-radius: 3px; }
  .cm.a { align-self: flex-start; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); border-bottom-left-radius: 3px; }
  .cm.a img, .cm.a video { max-width: 100%; border-radius: 6px; margin-top: 6px; }

  .chat-input-row {
    padding: 12px; border-top: 1px solid rgba(255,255,255,0.08);
    display: flex; gap: 8px;
  }

  .chat-input-row input {
    flex: 1; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    color: #fff; padding: 9px 12px; border-radius: 10px;
    font-size: 13px; outline: none; font-family: inherit;
  }
  .chat-input-row input:focus { border-color: rgba(255,200,100,0.3); }

  .chat-input-row button {
    background: rgba(255,255,255,0.15); color: #fff;
    border: 1px solid rgba(255,255,255,0.1);
    padding: 9px 14px; border-radius: 10px;
    font-weight: 600; cursor: pointer; font-size: 12px;
  }

  .modal {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    display: none; align-items: center; justify-content: center;
    padding: 20px;
  }
  .modal.open { display: flex; }

  .modal-box {
    background: rgba(25, 25, 35, 0.95);
    backdrop-filter: blur(30px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    width: 100%; max-width: 400px;
  }

  .modal-box h2 { font-size: 17px; margin-bottom: 18px; }

  .fld { margin-bottom: 16px; }
  .fld label { display: block; font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 6px; }
  .fld input {
    width: 100%; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fff; padding: 10px 14px; border-radius: 10px;
    font-size: 13px; font-family: inherit; outline: none;
  }
  .fld input:focus { border-color: rgba(255,200,100,0.4); }

  .m-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
  .btn-s { background: none; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); padding: 8px 16px; border-radius: 10px; cursor: pointer; font-size: 13px; }
  .btn-p { background: linear-gradient(135deg, #d4a84b, #b8860b); color: #1a1200; border: none; padding: 8px 18px; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 700; }

  @media (max-width: 640px) {
    .stats-row { gap: 30px; }
    .chat-panel { width: calc(100% - 40px); right: 20px; left: 20px; }
    .bg-card:nth-child(1), .bg-card:nth-child(3), .bg-card:nth-child(5) { display: none; }
    .controls { gap: 8px; }
    .gen-btn { width: 100%; justify-content: center; margin-left: 0; }
  }



  


    


      


      


      


      


      


    



  


    

A


    Aurora

⚙️

  


    


      


        New
        Seedance 2.5 is coming soon
      



      

Create AI Images & Videos
in Seconds



      


        30+ image tools, state-of-the-art video models, and growing.
        Turn any idea into stunning visuals — no design skills needed.
      



      


        
          
            
            
            
          
          Image
        
        
          
            
            
          
          Video
        
      



      


        


          

+


          
        


        


          


            

S


            Seedream 4.0
            ▼
          


          


            
            16:9
            9:16
          


          


            2K
            4K
          


          
            
              
            
            Generate
          
        


      



      


        

2025

Editor's pick


        

10M+

Active users


        

TOP 30

AI Platform


      


    



    


      

Your Creations


      


        


          

✨


          


            

✨ Your first creation


            

Generate something amazing to see it here


          


        


      


    



  💬

  


    


      

🎬 Aurora Creative Director


      ×
    


    


      

Welcome to Aurora Creative Studio! Describe what you want to create and I'll bring it to life. 🎬


    


    


      
      Send
    



  


    


      

Settings


      


        ARK API Key
        
      


      


        Session ID
        
      


      


        Cancel
        Save
      


    



Save as aurora.html. Build frontend

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bfd881d8-eaed-45ee-ac16-095b615061d4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
