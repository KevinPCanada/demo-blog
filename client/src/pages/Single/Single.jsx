import React from "react";
import { Link } from "react-router-dom";
import "./Single.css";

export default function Single({ post }) {
  return (
    <div className="single">
      <div className="content">
        <article className="post-container">
          <div className="primary-image-container">
            <img 
              src="https://images.pexels.com/photos/30426849/pexels-photo-30426849/free-photo-of-urban-black-and-white-bicycle-scene.jpeg"
              alt="Blog post main image"
            />
          </div>
          
          <div className="post-header">
            <div className="user">
              <img
                src="https://images.pexels.com/photos/371160/pexels-photo-371160.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="User profile"
              />
              <div className="info">
                <span>Username</span>
                <p>Posted 2 Days Ago</p>
              </div>
              <div className="edit">
                <Link to={`/write?edit=2`}>
                  <button>Edit</button>
                </Link>
                <button>Delete</button>
              </div>
            </div>
            
          </div>
          
          <div className="post-content">
          <h1>This is the blog's title</h1>
          <div className="article-body" dangerouslySetInnerHTML={{ __html: `
    <p>In the heart of Bologna's winding streets, where ancient culinary traditions remain steadfast against the tide of modernization, the art of pasta making continues much as it has for generations. Every morning, as the sun casts long shadows across cobblestone streets, local sfogline (pasta makers) gather in small workshops, armed with nothing more than wooden rolling pins, well-worn wooden boards, and generations of knowledge passed down through careful instruction and watchful eyes.</p>

    <p>The process begins with the simplest of ingredients: eggs and flour, nothing more. Yet in these two humble components lies the foundation of what many consider Italy's greatest culinary achievement. The sfogline create a small mountain of flour, carving out a crater at the top like a miniature volcano. Into this depression, they crack fresh eggs, their yolks golden and rich. With practiced fingers, they begin the delicate process of incorporating flour into egg, working from the inside out, until a shaggy dough begins to form.</p>

    <p>What follows is perhaps the most crucial yet underappreciated aspect of pasta making: the kneading. For upwards of fifteen minutes, the dough is worked against the board, folded and pressed, turned and stretched. This isn't merely about combining ingredients; it's about developing the gluten structure that will give the pasta its characteristic bite, what the Italians call "al dente." The dough transforms under these ministrations, becoming smooth and supple, responding to touch like living tissue.</p>

    <p>The true test of proper kneading comes when the dough is allowed to rest. Wrapped in cloth or plastic, it sits at room temperature, allowing the gluten to relax and the moisture to distribute evenly throughout the mass. This resting period, typically thirty minutes but sometimes longer, is as much about patience as it is about technique. Modern kitchens, with their emphasis on speed and efficiency, often skip this crucial step, but the sfogline know better. They use this time to prepare their workspaces, cleaning boards and gathering tools passed down through generations.</p>

    <p>Rolling the dough presents another challenge entirely. The sfogline begin with a small portion, pressing it flat with a rolling pin nearly two meters in length. The pin moves back and forth across the dough in a hypnotic rhythm, each stroke stretching the pasta ever thinner. The goal is to achieve a sheet so thin that one can read a newspaper through it – a traditional test of proper thickness. This process, repeated countless times throughout the morning, produces sheets of pasta that will eventually become tortellini, tagliatelle, or perhaps delicate squares of ravioli filled with seasonal ingredients from local markets.</p>

    <p>This dedication to traditional methods, while time-consuming, speaks to a deeper truth about Italian cuisine: that the simplest dishes often require the most skill to execute properly. In an age of pasta machines and automated production lines, these artisans maintain a connection to the past, preserving not just a method of food preparation, but a crucial piece of cultural heritage that enriches both their local community and the broader world of gastronomy.</p>
  `}} />
          </div>
        </article>
      </div>
    </div>
  );
}