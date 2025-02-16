rounded-lg transition-colors">
                            <i data-lucide="share-2" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <?php
        // Related wallpapers
        $related = get_posts(array(
            'post_type' => 'wallpaper',
            'posts_per_page' => 5,
            'post__not_in' => array(get_the_ID()),
            'tax_query' => array(
                array(
                    'taxonomy' => 'wallpaper_category',
                    'field' => 'id',
                    'terms' => wp_get_post_terms(get_the_ID(), 'wallpaper_category', array('fields' => 'ids'))
                )
            )
        ));

        if ($related): ?>
            <div class="mt-12">
                <h2 class="text-2xl font-bold text-white mb-6"><?php _e('Related Wallpapers', 'ringbuz'); ?></h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    <?php foreach ($related as $post):
                        setup_postdata($post);
                        get_template_part('template-parts/content', 'wallpaper');
                    endforeach;
                    wp_reset_postdata(); ?>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>