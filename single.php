<?php
/**
 * The template for displaying single posts
 */
get_header();

while (have_posts()): the_post();
    if (get_post_type() === 'wallpaper') {
        get_template_part('template-parts/single', 'wallpaper');
    } elseif (get_post_type() === 'ringtone') {
        get_template_part('template-parts/single', 'ringtone');
    } else {
        get_template_part('template-parts/single', 'default');
    }
endwhile;

get_footer();